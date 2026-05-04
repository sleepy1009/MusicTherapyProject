from django.conf import settings
import requests
from rest_framework_simplejwt.tokens import RefreshToken
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.utils import timezone
from django.shortcuts import get_object_or_404
from datetime import timedelta
import random
from django.db.models import Count

from .models import User, DiaryEntry, DassResult, Track, ListeningSession, SessionTrack, MusicFeedback, SpotifyTrack, ChatSession, ChatMessage
from .serializers import RegisterSerializer, UserSerializer, DiaryEntrySerializer, DassResultSerializer, ChatMessageSerializer
from .services import MusicTherapyEngine, ChatbotEngine

# API reg - all
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

# API Onboarding
class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = UserSerializer

    # override always return logged user
    def get_object(self):
        return self.request.user
    
class DiaryEntryListCreateView(generics.ListCreateAPIView):
    serializer_class = DiaryEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DiaryEntry.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class DiaryEntryDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DiaryEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DiaryEntry.objects.filter(user=self.request.user)
    

class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        if not token:
            return Response({"error": "Thiếu token từ Google"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            google_response = requests.get(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                headers={'Authorization': f'Bearer {token}'}
            )
            
            if not google_response.ok:
                 return Response({"error": "Token Google không hợp lệ hoặc đã hết hạn"}, status=status.HTTP_401_UNAUTHORIZED)
                 
            user_info = google_response.json()
            email = user_info.get('email')
            google_id = user_info.get('sub') 
            name = user_info.get('name')
            picture = user_info.get('picture')

            if not email:
                return Response({"error": "Không lấy được email từ Google"}, status=status.HTTP_400_BAD_REQUEST)

            user = User.objects.filter(Q(google_id=google_id) | Q(email=email)).first()

            if user:
                if not user.google_id:
                    user.google_id = google_id
                    user.save()
            else:
                base_username = email.split('@')[0]
                unique_username = f"{base_username}_{str(random.randint(1000, 9999))}"
                
                user = User(
                    username=unique_username,
                    email=email,
                    google_id=google_id,
                    display_name=name,
                    avatar=picture
                )
                
                user.set_unusable_password() 
                user.save()

            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'username': user.username
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print("Lỗi Google Login:", e)
            return Response({"error": "Đã xảy ra lỗi hệ thống"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# API DASS-21 
class DassResultListCreateView(generics.ListCreateAPIView):
    serializer_class = DassResultSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return DassResult.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class GenerateTherapyPlaylistView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        force_mode = request.query_params.get('force_mode', 'auto')
        
        latest_test = DassResult.objects.filter(user=user).order_by('-created_at').first()
        
        if not latest_test:
            return Response({"error": "Bạn cần làm bài test DASS-21 trước!"}, status=status.HTTP_400_BAD_REQUEST)

        is_severe = (
            latest_test.stress_level in ['Nặng', 'Rất nặng'] or
            latest_test.anxiety_level in ['Nặng', 'Rất nặng'] or
            latest_test.depression_level in ['Nặng', 'Rất nặng']
        )

        is_sos_flow = (force_mode == 'sos') or (force_mode == 'auto' and is_severe)
        if force_mode == 'normal': is_sos_flow = False

        liked_ids = set(user.liked_tracks.values_list('spotify_id', flat=True))

        if is_sos_flow:
            dominant = 'A'
            if latest_test.depression_score >= latest_test.anxiety_score and latest_test.depression_score >= latest_test.stress_score:
                dominant = 'D'
            
            if dominant == 'D' and (latest_test.anxiety_score >= 15 or latest_test.stress_score >= 26):
                dominant = 'A'

            prefix = 'sos_active_' if dominant == 'D' else 'sos_calm_'
            
            sos_tracks = Track.objects.filter(spotify_id__startswith=prefix).order_by('?')[:7]

            recommended = []
            for idx, t in enumerate(sos_tracks):
                recommended.append({
                    "id": t.spotify_id, "title": t.title, "artist": t.artist,
                    "image": t.album_cover, "youtube_id": t.youtube_id,
                    "duration": t.duration, "valence": t.valence,
                    "energy": t.energy, "tempo": t.tempo, "phase": idx + 1,
                    "isLiked": t.spotify_id in liked_ids
                })

            return Response({
                "is_sos": True,
                "recommended_tracks": recommended
            }, status=status.HTTP_200_OK)

        engine = MusicTherapyEngine()
        playlist_data = engine.generate_therapy_playlist(user, latest_test)

        for track in playlist_data['recommended_tracks']:
            track['isLiked'] = track['id'] in liked_ids

        playlist_data['is_sos'] = False
        return Response(playlist_data, status=status.HTTP_200_OK)
            
# API Session (save n get Playlist)
class ListeningSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session = ListeningSession.objects.filter(user=request.user).order_by('-created_at').first()
        if not session:
            return Response(None)
        
        liked_ids = set(request.user.liked_tracks.values_list('spotify_id', flat=True))
        
        tracks = []
        session_tracks = SessionTrack.objects.filter(session=session).select_related('track')
        
        for st in session_tracks:
            t = st.track
            tracks.append({
                "id": t.spotify_id, 
                "title": t.title, 
                "artist": t.artist, 
                "image": t.album_cover, 
                "youtube_id": t.youtube_id, 
                "duration": t.duration,
                "valence": t.valence,
                "energy": t.energy,
                "tempo": t.tempo,
                "isLiked": t.spotify_id in liked_ids
            })
        
        return Response({
            "id": session.id,
            "created_at": session.created_at,
            "tracks": tracks
        })

    def post(self, request):
        tracks_data = request.data.get('tracks', [])
        dass_id = request.data.get('dass_result_id')
        
        dass_result = DassResult.objects.filter(id=dass_id, user=request.user).first()
        if not dass_result:
            dass_result = DassResult.objects.filter(user=request.user).order_by('-created_at').first()

        session = ListeningSession.objects.create(user=request.user, dass_result=dass_result)
        
        session_tracks_to_create = []
        for index, t_data in enumerate(tracks_data):
            
            track, created = Track.objects.update_or_create(
                spotify_id=t_data['id'],
                defaults={
                    'title': t_data.get('title', '')[:255],
                    'artist': t_data.get('artist', '')[:255],
                    'album_cover': t_data.get('image', ''),
                    'youtube_id': t_data.get('youtube_id', ''),
                    'duration': t_data.get('duration', ''),      
                    'valence': t_data.get('valence', 0.5),
                    'energy': t_data.get('energy', 0.5),
                    'tempo': t_data.get('tempo', 100)
                }
            )
            
            session_tracks_to_create.append(
                SessionTrack(session=session, track=track, order_index=index + 1)
            )
            
        SessionTrack.objects.bulk_create(session_tracks_to_create)
            
        return Response({"status": "success", "session_id": session.id})
        
# API YouTube Links 
class FetchYouTubeLinksView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        tracks = request.data.get('tracks', [])
        if not tracks:
            return Response({"error": "Danh sách nhạc trống"}, status=status.HTTP_400_BAD_REQUEST)

        engine = MusicTherapyEngine()
        enriched_tracks = engine.fetch_youtube_details(tracks)

        return Response({"enriched_tracks": enriched_tracks}, status=status.HTTP_200_OK)
    
# API (Swap Options)
class SwapOptionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        current_track_id = request.query_params.get('current_track_id')
        phase = int(request.query_params.get('phase', 1))
        dass_id = request.query_params.get('dass_id')

        dass_result = DassResult.objects.filter(id=dass_id, user=request.user).first()
        if not dass_result:
            dass_result = DassResult.objects.filter(user=request.user).order_by('-created_at').first()

        engine = MusicTherapyEngine()
        options = engine.get_swap_options(request.user, dass_result, phase, current_track_id)
        
        return Response({"options": options}, status=status.HTTP_200_OK)

# API (swap Playlist n feedback)
class SwapConfirmView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get('session_id')
        old_track_id = request.data.get('old_track_id')
        new_track_data = request.data.get('new_track_data') 
        order_index = request.data.get('order_index')

        old_track = Track.objects.filter(spotify_id=old_track_id).first()
        if old_track:
            self._apply_feedback(request.user, old_track.spotify_id, 'SWAPPED')

        if session_id:
            try:
                session_track = SessionTrack.objects.get(session_id=session_id, order_index=order_index)
                
                new_track, _ = Track.objects.update_or_create(
                    spotify_id=new_track_data['id'],
                    defaults={
                        'title': new_track_data.get('title', '')[:255],
                        'artist': new_track_data.get('artist', '')[:255],
                        'album_cover': new_track_data.get('image', ''),
                        'youtube_id': new_track_data.get('youtube_id', ''),
                        'duration': new_track_data.get('duration', ''),
                        'valence': new_track_data.get('valence', 0.5),
                        'energy': new_track_data.get('energy', 0.5),
                        'tempo': new_track_data.get('tempo', 100)
                    }
                )
                
                session_track.track = new_track
                session_track.save()
            except SessionTrack.DoesNotExist:
                return Response({"error": "Vị trí bài hát không tồn tại trong session"}, status=404)

        return Response({"status": "success"}, status=status.HTTP_200_OK)

    def _apply_feedback(self, user, track_id, action):
        # (Intelligence Logic)
        track = SpotifyTrack.objects.filter(track_id=track_id).first()
        if not track: return
        
        prefs = user.music_preferences
        weights = prefs.get('genre_weights', {})
        current_w = weights.get(track.genre, 1.0)
        
        weights[track.genre] = round(max(0.1, current_w - 0.03), 2)
        prefs['genre_weights'] = weights
        user.save()

# handleNext/handlePrev
class MusicFeedbackView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        track_id = request.data.get('track_id')
        action = request.data.get('action') # 'SKIPPED' / 'COMPLETED'
        
        track = SpotifyTrack.objects.filter(track_id=track_id).first()
        if not track: return Response({"status": "ignored"})

        prefs = user.music_preferences
        weights = prefs.get('genre_weights', {})
        current_w = weights.get(track.genre, 1.0)

        if action == 'SKIPPED':
            new_w = max(0.1, current_w - 0.05)
        elif action == 'COMPLETED':
            new_w = min(2.0, current_w + 0.05)
        else:
            new_w = current_w

        weights[track.genre] = round(new_w, 2)
        prefs['genre_weights'] = weights
        user.save()
        return Response({"status": "success", "new_weight": new_w})    

# API TabStats (Iso Curve, Time & Genre)
class UserStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now()
        
        time_filter = request.query_params.get('filter', 'month')
        session_id = request.query_params.get('session_id')

        liked_ids = set(user.liked_tracks.values_list('spotify_id', flat=True))

        # 1. SESSION
        all_sessions = ListeningSession.objects.filter(user=user)\
            .order_by('-created_at')\
            .select_related('dass_result')\
            .annotate(track_count_db=Count('tracks'))
            
        history_data = []
        for s in all_sessions:
            history_data.append({
                "id": s.id,
                "date": s.created_at.strftime('%d/%m/%Y'),
                "stress": s.dass_result.stress_level if s.dass_result else "Bình thường",
                "anxiety": s.dass_result.anxiety_level if s.dass_result else "Bình thường",
                "depression": s.dass_result.depression_level if s.dass_result else "Bình thường",
                "track_count": s.track_count_db 
            })

        # 2. ISO
        if session_id:
            target_session = ListeningSession.objects.filter(id=session_id, user=user).first()
        else:
            target_session = all_sessions.first()

        iso_data = []
        if target_session:
            sts = SessionTrack.objects.filter(session=target_session).select_related('track')
            for st in sts:
                iso_data.append({
                    "id": st.track.spotify_id,
                    "name": f"B.{st.order_index}",
                    "title": st.track.title,           
                    "artist": st.track.artist,         
                    "image": st.track.album_cover,     
                    "youtube_id": st.track.youtube_id, 
                    "duration": st.track.duration,    
                    "valence": st.track.valence,
                    "energy": st.track.energy,
                    "tempo": st.track.tempo,
                    "isLiked": st.track.spotify_id in liked_ids
                })

        # 3. TIME STATS
        from datetime import timedelta
        if time_filter == 'week':
            days_back = 7
            start_date = now - timedelta(days=7)
        elif time_filter == 'year':
            days_back = 365
            start_date = now - timedelta(days=365)
        else: # month
            days_back = 30
            start_date = now - timedelta(days=30)

        recent_sessions = ListeningSession.objects.filter(user=user, created_at__gte=start_date).prefetch_related('tracks')
        
        time_dict = {}
        if time_filter == 'year':
            for i in range(11, -1, -1):
                m = now.month - i
                y = now.year
                if m <= 0:
                    m += 12
                    y -= 1
                key = f"{m:02d}/{y}"
                time_dict[key] = {"name": f"T{m}", "minutes": 0, "sort_key": f"{y}{m:02d}"}
        else:
            weekday_map = {0: 'T2', 1: 'T3', 2: 'T4', 3: 'T5', 4: 'T6', 5: 'T7', 6: 'CN'}
            for i in range(days_back - 1, -1, -1):
                d = now - timedelta(days=i)
                key = d.strftime('%d/%m')
                label = weekday_map[d.weekday()] if time_filter == 'week' else key
                time_dict[key] = {"name": label, "minutes": 0, "sort_key": d.strftime('%Y%m%d')}

        for s in recent_sessions:
            key = s.created_at.strftime('%m/%Y') if time_filter == 'year' else s.created_at.strftime('%d/%m')
            
            if key in time_dict:
                total_seconds = 0
                for t in s.tracks.all():
                    if t.duration:
                        try:
                            parts = t.duration.split(':')
                            if len(parts) == 2: total_seconds += int(parts[0]) * 60 + int(parts[1])
                            elif len(parts) == 3: total_seconds += int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
                        except: pass
                time_dict[key]["minutes"] += round(total_seconds / 60)
        
        time_data = [{"name": v["name"], "minutes": v["minutes"]} for v in sorted(time_dict.values(), key=lambda x: x["sort_key"])]

        # 4. GENRE STATS
        
        recent_track_ids = SessionTrack.objects.filter(
            session__user=user, 
            session__created_at__gte=start_date
        ).values_list('track_id', flat=True)
        
        genre_stats_raw = SpotifyTrack.objects.filter(
            track_id__in=recent_track_ids
        ).values('genre').annotate(count=Count('genre')).order_by('-count')

        colors = ['#66D0BC', '#41A67E', '#cbf4d8', '#FFB76C', '#888888']
        genre_data = []
        other_count = 0
        
        for i, item in enumerate(genre_stats_raw):
            g_name = item['genre'].capitalize()
            if i < 3:
                genre_data.append({
                    "name": g_name, 
                    "value": item['count'], 
                    "color": colors[i]
                })
            else:
                other_count += item['count']

        sos_count = Track.objects.filter(
            spotify_id__in=recent_track_ids, 
            spotify_id__startswith='sos_'
        ).count()
        
        if sos_count > 0:
            genre_data.append({"name": "Nhạc Trị liệu", "value": sos_count, "color": "#8CE4FF"})

        if other_count > 0:
            genre_data.append({"name": "Khác", "value": other_count, "color": colors[4]})

        return Response({
            "session_history": history_data, 
            "iso_curve": iso_data,
            "time_stats": time_data,
            "genre_stats": genre_data,
            "liked_count": user.liked_tracks.count()
        }, status=status.HTTP_200_OK)
        
# 12. API Toggle Like
class ToggleLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        track_data = request.data.get('track')
        if not track_data:
            return Response({"error": "No track data"}, status=400)

        track, _ = Track.objects.update_or_create(
            spotify_id=track_data['id'],
            defaults={
                'title': track_data.get('title', '')[:255],
                'artist': track_data.get('artist', '')[:255],
                'album_cover': track_data.get('image', ''),
                'youtube_id': track_data.get('youtube_id', ''),
                'duration': track_data.get('duration', ''),
                'valence': track_data.get('valence', 0.5),
                'energy': track_data.get('energy', 0.5),
                'tempo': track_data.get('tempo', 100)
            }
        )

        user = request.user
        if track in user.liked_tracks.all():
            user.liked_tracks.remove(track)
            is_liked = False
        else:
            user.liked_tracks.add(track)
            is_liked = True

        return Response({"status": "success", "is_liked": is_liked})

# 13. API playlist liked
class LikedTracksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        tracks = request.user.liked_tracks.all().order_by('-liked_by__id')
        data = []
        for t in tracks:
            data.append({
                "id": t.spotify_id,
                "title": t.title,
                "artist": t.artist,
                "image": t.album_cover,
                "youtube_id": t.youtube_id,
                "duration": t.duration,
                "valence": t.valence,
                "energy": t.energy,
                "tempo": t.tempo,
                "isLiked": True
            })
        return Response(data, status=200)
    
class BuildLikedTherapyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        liked_tracks = user.liked_tracks.all()
        
        if liked_tracks.count() < 14:
            return Response({"error": "Cần tối thiểu 14 bài hát yêu thích để AI phân tích lộ trình"}, status=400)
            
        latest_test = DassResult.objects.filter(user=user).order_by('-created_at').first()
        if not latest_test:
            return Response({"error": "Hãy làm bài test tâm lý trước"}, status=400)

        engine = MusicTherapyEngine()
        
        dominant = 'A'
        if latest_test.depression_score >= latest_test.anxiety_score: dominant = 'D'
        
        data = []
        for i in range(1, 8):
            target_e = 0.3 + (i * 0.08) if dominant == 'D' else 0.8 - (i * 0.1)
            closest_track = min(list(liked_tracks), key=lambda t: abs(t.energy - target_e))
            
            data.append({
                "id": closest_track.spotify_id, "title": closest_track.title, "artist": closest_track.artist,
                "image": closest_track.album_cover, "youtube_id": closest_track.youtube_id,
                "isLiked": True, "valence": closest_track.valence, "energy": closest_track.energy, "tempo": closest_track.tempo
            })
        
        return Response(data)
    
class ChatInteractView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        session_id = request.query_params.get('session_id')
        
        if session_id:
            session = ChatSession.objects.filter(id=session_id, user=request.user).first()
        else:
            session = ChatSession.objects.filter(user=request.user).order_by('-created_at').first()
        
        if not session:
            return Response([]) 
        
        messages = ChatMessage.objects.filter(session=session).order_by('timestamp')
        serializer = ChatMessageSerializer(messages, many=True)
        return Response(serializer.data)

    def post(self, request):
        user = request.user
        content = request.data.get('content')
        session_id = request.data.get('session_id') 
        current_song = request.data.get('current_song', 'Không rõ') 
        user_name = request.user.display_name or request.user.username

        is_system_event = request.data.get('is_system_event', False)
        
        if not content:
            return Response({"error": "Thiếu nội dung"}, status=400)

        if session_id:
            session = ChatSession.objects.filter(id=session_id, user=user).first()
        else:
            session, _ = ChatSession.objects.get_or_create(user=user, is_active=True)


        if session.title == "Cuộc trò chuyện mới" or not session.title:
            session.title = (content[:25] + '...') if len(content) > 25 else content
            session.save()

        if not is_system_event:
            ChatMessage.objects.create(session=session, sender=ChatMessage.Sender.USER, content=content)

        history = ChatMessage.objects.filter(session=session).order_by('-timestamp')[:10]
        history = list(reversed(history))

        content_to_engine = content
        if is_system_event:
            content_to_engine = f"[CHỈ THỊ NGẦM TỪ HỆ THỐNG ĐỂ BOT CHỦ ĐỘNG]: {content}"

        from .models import DassResult
        dass = DassResult.objects.filter(user=request.user).order_by('-created_at').first()
        dass_scores = {
            'depression': dass.depression_score if dass else 0,
            'anxiety': dass.anxiety_score if dass else 0,
            'stress': dass.stress_score if dass else 0
        }

        user_age = request.user.age

        engine = ChatbotEngine()
        bot_response_text, is_emergency = engine.generate_response(
            content_to_engine, history, user_name, user_age, current_song, dass_scores
        )

        action = None
        if "[MUSIC_PREF: DISLIKE]" in bot_response_text:
            action = 'SKIPPED'
            bot_response_text = bot_response_text.replace("[MUSIC_PREF: DISLIKE]", "").strip()
        elif "[MUSIC_PREF: LIKE]" in bot_response_text:
            action = 'COMPLETED'
            bot_response_text = bot_response_text.replace("[MUSIC_PREF: LIKE]", "").strip()

        current_track_id = request.data.get('current_track_id')
        if action and current_track_id:
            track = SpotifyTrack.objects.filter(track_id=current_track_id).first()
            if track:
                prefs = user.music_preferences
                weights = prefs.get('genre_weights', {})
                current_w = weights.get(track.genre, 1.0)
                
                if action == 'SKIPPED':
                    new_w = max(0.1, current_w - 0.05)
                elif action == 'COMPLETED':
                    new_w = min(2.0, current_w + 0.05)
                
                weights[track.genre] = round(new_w, 2)
                prefs['genre_weights'] = weights
                user.save()
                print(f"🎯 AI tự động chấm điểm: Đã {action} thể loại {track.genre} (Trọng số mới: {new_w})")

        bot_msg = ChatMessage.objects.create(session=session, sender=ChatMessage.Sender.BOT, content=bot_response_text)

        return Response({
            "status": "success",
            "reply": ChatMessageSerializer(bot_msg).data,
            "session_title": session.title,
            "is_emergency": is_emergency
        })
        

class ChatSessionListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sessions = ChatSession.objects.filter(user=request.user)
        data = [{"id": s.id, "title": s.title, "date": s.created_at} for s in sessions]
        return Response(data)

    def post(self, request):
        ChatSession.objects.filter(user=request.user).update(is_active=False)
        new_session = ChatSession.objects.create(user=request.user, is_active=True)
        return Response({"id": new_session.id, "title": new_session.title})

class ChatSessionDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, session_id):
        session = ChatSession.objects.filter(id=session_id, user=request.user).first()
        if session:
            session.delete()
            return Response(status=204)
        return Response(status=404)
    

class ManualChatSummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        session_id = request.data.get('session_id')
        
        session = ChatSession.objects.filter(id=session_id, user=user).first()
        if not session:
            return Response({"error": "Phiên chat không tồn tại"}, status=404)

        messages = ChatMessage.objects.filter(session=session).order_by('timestamp')
        if messages.count() < 2:
            return Response({"error": "Đoạn chat quá ngắn để tóm tắt"}, status=400)

        from .services import ChatbotEngine
        engine = ChatbotEngine()
        title, content = engine.summarize_to_diary(messages)

        if title and content:
            diary = DiaryEntry.objects.create(
                user=user,
                title=title[:255],
                content=content,
                theme='theme-forest'
            )
            return Response({
                "status": "success", 
                "message": "Đã lưu vào nhật ký",
                "diary_id": diary.id
            })
        
        return Response({"error": "AI không thể tóm tắt đoạn chat này"}, status=500)
    

class UpdateSessionMoodView(APIView):
    def patch(self, request, session_id):
        session = get_object_or_404(ListeningSession, id=session_id, user=request.user)
        session.mood_before = request.data.get('mood_before', session.mood_before)
        session.mood_after = request.data.get('mood_after', session.mood_after)
        session.save()
        return Response({"status": "success"})