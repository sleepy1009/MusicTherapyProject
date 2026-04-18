from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from datetime import timedelta
from django.utils import timezone
from .models import User, DiaryEntry, DassResult, Track, ListeningSession, SessionTrack, MusicFeedback, SpotifyTrack
from .serializers import RegisterSerializer, UserSerializer, DiaryEntrySerializer, DassResultSerializer
from .services import MusicTherapyEngine

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
    
# 5. API DASS-21 (Tạo mới & Lấy lịch sử)
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
        
        latest_test = DassResult.objects.filter(user=user).order_by('-created_at').first()
        
        if not latest_test:
            return Response({"error": "Bạn cần làm bài test DASS-21 trước!"}, status=status.HTTP_400_BAD_REQUEST)

        engine = MusicTherapyEngine()
        playlist_data = engine.generate_therapy_playlist(user, latest_test)

        liked_ids = set(user.liked_tracks.values_list('spotify_id', flat=True))
        for track in playlist_data['recommended_tracks']:
            track['isLiked'] = track['id'] in liked_ids

        return Response(playlist_data, status=status.HTTP_200_OK)
    
# 7. API Quản lý Session (Lưu và Lấy Playlist)
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
        
# 8. API Lấy YouTube Links (Cho phép cả Guest truy cập)
class FetchYouTubeLinksView(APIView):
    permission_classes = [AllowAny] 

    def post(self, request):
        tracks = request.data.get('tracks', [])
        if not tracks:
            return Response({"error": "Danh sách nhạc trống"}, status=status.HTTP_400_BAD_REQUEST)

        engine = MusicTherapyEngine()
        enriched_tracks = engine.fetch_youtube_details(tracks)

        return Response({"enriched_tracks": enriched_tracks}, status=status.HTTP_200_OK)
    
# 9. API Lấy các bài hát thay thế (Swap Options)
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

# 10. API Chốt đổi bài (Ghi đè Playlist & Chấm điểm Feedback)
class SwapConfirmView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        session_id = request.data.get('session_id')
        old_track_id = request.data.get('old_track_id')
        new_track_data = request.data.get('new_track_data') 
        order_index = request.data.get('order_index')

        # 1. Trừ điểm bài cũ (Ghi log Feedback SKIPPED)
        old_track = Track.objects.filter(spotify_id=old_track_id).first()
        if old_track:
            MusicFeedback.objects.create(
                user=request.user, 
                track=old_track, 
                action=MusicFeedback.Action.SKIPPED
            )

        # 2. Cập nhật Playlist nếu đang nghe Playlist đã lưu
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
                pass 

        return Response({"status": "success"}, status=status.HTTP_200_OK)
    

# 11. API Thống kê cho TabStats (Gộp cả Iso Curve, Time & Genre)
class UserStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
            user = request.user
            now = timezone.now()
            
            time_filter = request.query_params.get('filter', 'month')
            session_id = request.query_params.get('session_id')

            liked_ids = set(user.liked_tracks.values_list('spotify_id', flat=True))

            all_sessions = ListeningSession.objects.filter(user=user).order_by('-created_at').select_related('dass_result')
            history_data = []
            for s in all_sessions:
                history_data.append({
                    "id": s.id,
                    "date": s.created_at.strftime('%d/%m/%Y'),
                    "stress": s.dass_result.stress_level if s.dass_result else "Bình thường",
                    "anxiety": s.dass_result.anxiety_level if s.dass_result else "Bình thường",
                    "depression": s.dass_result.depression_level if s.dass_result else "Bình thường",
                    "track_count": s.tracks.count()
                })

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

            recent_track_ids = SessionTrack.objects.filter(
                session__user=user, 
                session__created_at__gte=start_date
            ).values_list('track_id', flat=True)
            
            spotify_tracks = SpotifyTrack.objects.filter(track_id__in=list(recent_track_ids))
            genre_counts = {}
            for st in spotify_tracks:
                g = st.genre.capitalize()
                genre_counts[g] = genre_counts.get(g, 0) + 1
                
            sorted_genres = sorted(genre_counts.items(), key=lambda x: x[1], reverse=True)
            colors = ['#66D0BC', '#41A67E', '#cbf4d8', '#888888', '#FFB76C']
            
            genre_data = [{"name": g, "value": count, "color": colors[i if i < len(colors) else -1]} for i, (g, count) in enumerate(sorted_genres[:3])]
            if len(sorted_genres) > 3: 
                genre_data.append({"name": "Khác", "value": sum([x[1] for x in sorted_genres[3:]]), "color": colors[3]})

            return Response({
                "session_history": history_data, 
                "iso_curve": iso_data,
                "time_stats": time_data,
                "genre_stats": genre_data,
                "liked_count": user.liked_tracks.count()
            }, status=status.HTTP_200_OK)
    
# 12. API Thả tim / Bỏ thả tim (Toggle Like)
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
        # Logic Toggle: Có rồi thì xóa, chưa có thì thêm
        if track in user.liked_tracks.all():
            user.liked_tracks.remove(track)
            is_liked = False
        else:
            user.liked_tracks.add(track)
            is_liked = True

        return Response({"status": "success", "is_liked": is_liked})

# 13. API Lấy danh sách toàn bộ nhạc đã thả tim
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
            return Response({"error": "Cần tối thiểu 14 bài hát yêu thích"}, status=400)
            
        # Logic: Lấy kết quả DASS mới nhất và lọc 7 bài từ kho Like theo luật ISO
        # (Tạm thời dùng logic đơn giản: Bốc 7 bài ngẫu nhiên từ kho Like)
        import random
        selected = random.sample(list(liked_tracks), 7)
        
        data = [{
            "id": t.spotify_id, "title": t.title, "artist": t.artist,
            "image": t.album_cover, "youtube_id": t.youtube_id,
            "isLiked": True, "valence": t.valence, "energy": t.energy, "tempo": t.tempo
        } for t in selected]
        
        return Response(data)