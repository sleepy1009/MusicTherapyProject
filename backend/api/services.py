import math
import random
import heapq
from ytmusicapi import YTMusic
from .models import SpotifyTrack
import requests
from concurrent.futures import ThreadPoolExecutor
from django.conf import settings
import os
from google import genai
from google.genai import types
import re
import time

class MusicTherapyEngine:
    def __init__(self):
        self.ytmusic = YTMusic()
        # recommend
        self.safe_genres = ['acoustic', 'piano', 'ambient', 'classical', 'lofi', 'chill', 'sleep']
        # not recommend
        self.high_energy_genres = ['edm', 'rock', 'rap', 'metal', 'dance', 'hardstyle']
        # ignore, add if user like
        self.regional_genres = [
            'bollywood', 'indian', 'latin', 'latino', 'spanish', 'salsa', 'tango', 'samba', 
            'j-pop', 'j-rock', 'k-pop', 'mandopop', 'cantopop', 'malay', 'turkish', 'iranian', 
            'french', 'german', 'swedish', 'brazil', 'reggaeton', 'afrobeat'
        ]

    def generate_therapy_playlist(self, user, dass_result):
        from .models import Track
        import random

        s = dass_result.stress_score
        a = dass_result.anxiety_score
        d = dass_result.depression_score
        
        scores = {'S': s, 'A': a, 'D': d}
        dominant = max(scores, key=scores.get)

        # SAFETY OVERRIDE
        if dominant == 'D' and (a >= 15 or s >= 26):
            dominant = 'A'

        # two phase (Euclid)
        if dominant == 'A': 
            # Down-regulation 
            iso_phases = [
                (0.3, 0.8, 120, 0.0), 
                (0.4, 0.7, 105, 0.2), 
                (0.5, 0.6, 90, 0.4),  
                (0.6, 0.5, 80, 0.6),  
            ]
        elif dominant == 'D': 
            # Up-regulation
            iso_phases = [
                (0.2, 0.1, 55, 0.0), 
                (0.3, 0.2, 65, 0.0), 
                (0.4, 0.4, 80, 0.0), 
                (0.5, 0.6, 95, 0.0), 
            ]
        else: 
            # Release & Down-regulation
            iso_phases = [
                (0.3, 0.7, 95, 0.0), 
                (0.4, 0.6, 90, 0.1),
                (0.5, 0.5, 85, 0.2), 
                (0.6, 0.4, 80, 0.4), 
            ]

        genre_map = {
            'pop_group': ['pop', 'mandopop', 'cantopop', 'singer-songwriter'],
            'kpop_group': ['k-pop', 'j-pop', 'anime'],
            'lofi_group': ['chill', 'lofi', 'sad', 'sleep', 'study'],
            'acoustic_group': ['acoustic', 'indie', 'guitar', 'folk'],
            'rnb_group': ['r-n-b', 'soul', 'groove'],
            'hiphop_group': ['hip-hop', 'trip-hop'],
            'piano_group': ['piano', 'ambient', 'new-age'],
            'classical_group': ['classical', 'opera'],
            'edm_group': ['edm', 'dance', 'house', 'techno', 'electro'],
            'rock_group': ['rock', 'alt-rock', 'punk-rock']
        }

        liked_groups = user.music_preferences.get('liked_genres', [])
        disliked_groups = user.music_preferences.get('disliked_genres', [])
        
        liked = []
        for g in liked_groups: liked.extend(genre_map.get(g, []))
            
        disliked = []
        for g in disliked_groups: disliked.extend(genre_map.get(g, []))
        
        actual_disliked = set(disliked + self.regional_genres)
        actual_disliked = [g for g in actual_disliked if g not in liked]
        target_genres = list(set(liked + self.safe_genres))

        has_conflict = False
        conflict_msg = ""
        if dominant in ['A', 'S'] and any(g in self.high_energy_genres for g in liked):
            has_conflict = True
            conflict_msg = "MindMelody nhận thấy bạn đang có chỉ số căng thẳng khá cao. Để đảm bảo an toàn, hệ thống đã tạm thời giảm bớt các bản nhạc điện tử mạnh mẽ trong sở thích của bạn. Hãy thả lỏng nhé."

        playlist = []
        liked_ids = set(user.liked_tracks.values_list('spotify_id', flat=True))

        # 4 steps
        for phase_idx, (ideal_v, ideal_e, ideal_t, ideal_i) in enumerate(iso_phases):
            tracks = self._find_nearest_tracks(
                target_v=ideal_v, target_e=ideal_e, target_t=ideal_t, target_i=ideal_i,
                target_genres=target_genres, disliked_genres=actual_disliked,
                limit=9  # Lấy 9 bài Grid 3x3
            )
            for t in tracks:
                t['phase'] = phase_idx + 1 # 
                t['isLiked'] = t['id'] in liked_ids
            playlist.extend(tracks)

        playlist = self._fetch_spotify_covers(playlist)

        # last phase
        if dominant == 'D':
            # Up-regulation
            sos_tracks = list(Track.objects.filter(spotify_id__startswith='sos_active_'))
        else:
            # Down-regulation
            sos_tracks = list(Track.objects.filter(spotify_id__startswith='sos_calm_'))

        num_needed = 9 * 3 # 3 pha, mỗi pha 9 bài
        if len(sos_tracks) >= num_needed:
            selected_sos = random.sample(sos_tracks, num_needed)
        else:
            selected_sos = sos_tracks
            random.shuffle(selected_sos)

        for i, p in enumerate([5, 6, 7]):
            start_idx = i * 9
            end_idx = start_idx + 9
            phase_tracks = selected_sos[start_idx:end_idx]

            for t in phase_tracks:
                playlist.append({
                    "id": t.spotify_id, 
                    "title": t.title,
                    "artist": t.artist,
                    "genre": "Therapeutic",
                    "image": t.album_cover,
                    "youtube_id": t.youtube_id,
                    "duration": t.duration,
                    "valence": t.valence,
                    "energy": t.energy,
                    "tempo": t.tempo,
                    "phase": p, 
                    "isLiked": t.spotify_id in liked_ids
                })

        return {
            "is_sos": False,
            "has_conflict": has_conflict,
            "conflict_message": conflict_msg,
            "recommended_tracks": playlist
        }


    def _find_nearest_tracks(self, target_v, target_e, target_t, target_i, target_genres, disliked_genres, limit=9, exclude_id=None, user=None):

        queryset = SpotifyTrack.objects.exclude(genre__in=disliked_genres).filter(
            youtube_id__isnull=False
        ).exclude(youtube_id="not_found")

        if exclude_id:
            queryset = queryset.exclude(track_id=exclude_id)
        if target_genres:
            queryset = queryset.filter(genre__in=target_genres)
            
        total_count = queryset.count()
        
        if total_count == 0:
            queryset = SpotifyTrack.objects.exclude(genre__in=disliked_genres).filter(
                youtube_id__isnull=False
            ).exclude(youtube_id="not_found")
            total_count = queryset.count()

        # 250 songs/1
        candidates = []
        if total_count > 250:
            random_offset = random.randint(0, total_count - 250) # O(1)
            candidates = list(queryset[random_offset:random_offset + 250])
            random.shuffle(candidates) 
        else:
            candidates = list(queryset)

        genre_weights = {}
        if user:
            genre_weights = user.music_preferences.get('genre_weights', {})
        # (Euclidean Distance)
        def calculate_distance(track):
            base_dist = math.sqrt(
                (((track.tempo - target_t) / 200) ** 2) * 4.0 +    
                ((track.energy - target_e) ** 2) * 2.0 +           
                ((track.valence - target_v) ** 2) * 1.5 +          
                ((track.instrumentalness - target_i) ** 2) * 1.0   
            )

            """
            base_dist = math.sqrt(
                ((track.valence - target_v) ** 2) * 1.5 +  
                ((track.energy - target_e) ** 2) * 1.2 +
                (((track.tempo - target_t) / 200) ** 2) * 1.0 +
                ((track.instrumentalness - target_i) ** 2) * 2.0
            )
            """
            
            
            # Nếu weight > 1 (like) -> pick
            # Nếu weight < 1 (dislike) -> harder
            weight = genre_weights.get(track.genre, 1.0)
            return base_dist / weight

        best_tracks = heapq.nsmallest(limit, candidates, key=calculate_distance)

        # Map 
        result = []
        for track in best_tracks:
            result.append({
                "id": track.track_id, 
                "title": track.track_name,
                "artist": track.artists,
                "genre": track.genre,
                "image": track.image,           
                "youtube_id": track.youtube_id, 
                "duration": track.duration,
                "valence": round(track.valence, 2),
                "energy": round(track.energy, 2),
                "tempo": round(track.tempo, 0)
            })
        return result

    def _attach_youtube_ids(self, track_list):
        def search_yt(track):
            query = f"{track['title']} {track['artist']} audio"
            try:
                search_results = self.ytmusic.search(query, filter="songs", limit=1)
                if search_results:
                    track['youtube_id'] = search_results[0]['videoId']
                    if 'thumbnails' in search_results[0] and search_results[0]['thumbnails']:
                        track['cover'] = search_results[0]['thumbnails'][-1]['url']
                else:
                    track['youtube_id'] = None
            except Exception as e:
                track['youtube_id'] = None
            return track

        # use 10-15 thread, may get blocked if higher
        with ThreadPoolExecutor(max_workers=15) as executor:
            result_tracks = list(executor.map(search_yt, track_list))
        
        return[t for t in result_tracks if t.get('youtube_id')]
    

    def _fetch_spotify_covers(self, track_list):
        def get_cover(track):
            try:
                res = requests.get(f"https://open.spotify.com/oembed?url=spotify:track:{track['id']}", timeout=2)
                if res.status_code == 200:
                    data = res.json()
                    track['image'] = data.get("thumbnail_url", track['image'])
            except:
                pass 
            return track

        with ThreadPoolExecutor(max_workers=20) as executor:
            list(executor.map(get_cover, track_list))
        
        return track_list
    
    def fetch_youtube_details(self, tracks):
        def get_yt_info(track):
            if track.get('youtube_id') and track.get('youtube_id') != "not_found":
                return track

            query = f"{track['title']} {track['artist']} audio"
            try:
                search_results = self.ytmusic.search(query, filter="songs", limit=1)
                if search_results:
                    top_result = search_results[0]
                    track['youtube_id'] = top_result['videoId']
                    
                    track['duration'] = top_result.get('duration', '0:00')
                    
                    if 'thumbnails' in top_result and top_result['thumbnails']:
                        track['image'] = top_result['thumbnails'][-1]['url']
                else:
                    track['youtube_id'] = None
            except Exception as e:
                print(f"Lỗi YouTube Search cho {track['title']}: {e}")
                track['youtube_id'] = None
            return track

        with ThreadPoolExecutor(max_workers=7) as executor:
            enriched_tracks = list(executor.map(get_yt_info, tracks))
            
        return [t for t in enriched_tracks if t.get('youtube_id')]
    

    def get_swap_options(self, user, dass_result, phase_index, exclude_track_id):
        s = dass_result.stress_score
        a = dass_result.anxiety_score
        d = dass_result.depression_score
        dominant = 'A' 
        if d >= a and d >= s: dominant = 'D'
        if s > a and s > d: dominant = 'S'

        # (phase_index 1 -> 7)
        if dominant == 'D': 
            iso_phases = [(0.3, 0.3, 80, 0.0), (0.35, 0.4, 85, 0.0), (0.4, 0.5, 90, 0.0), (0.5, 0.6, 95, 0.0), (0.6, 0.7, 100, 0.0), (0.65, 0.75, 105, 0.0), (0.7, 0.8, 110, 0.0)]
        elif dominant == 'A': 
            iso_phases = [(0.5, 0.5, 90, 0.2), (0.5, 0.4, 85, 0.3), (0.5, 0.3, 80, 0.5), (0.55, 0.25, 75, 0.6), (0.6, 0.2, 70, 0.7), (0.6, 0.15, 65, 0.8), (0.6, 0.1, 60, 0.9)]
        else: 
            iso_phases = [(0.4, 0.5, 90, 0.3), (0.45, 0.45, 85, 0.4), (0.5, 0.4, 80, 0.5), (0.55, 0.35, 75, 0.6), (0.6, 0.3, 70, 0.7), (0.6, 0.25, 65, 0.8), (0.6, 0.2, 60, 0.9)]

        ideal_v, ideal_e, ideal_t, ideal_i = iso_phases[phase_index - 1]

        liked = user.music_preferences.get('liked_genres', [])
        disliked = user.music_preferences.get('disliked_genres', [])
        
        genre_map = {
            'pop_group': ['pop', 'mandopop', 'cantopop', 'singer-songwriter'],
            'kpop_group': ['k-pop', 'j-pop', 'anime'],
            'lofi_group': ['chill', 'lofi', 'sad', 'sleep', 'study'],
            'acoustic_group': ['acoustic', 'indie', 'guitar', 'folk'],
            'rnb_group': ['r-n-b', 'soul', 'groove'],
            'hiphop_group': ['hip-hop', 'trip-hop'],
            'piano_group': ['piano', 'ambient', 'new-age'],
            'classical_group': ['classical', 'opera'],
            'edm_group': ['edm', 'dance', 'house', 'techno', 'electro'],
            'rock_group': ['rock', 'alt-rock', 'punk-rock']
        }
        
        liked_genres = []
        for g in liked: liked_genres.extend(genre_map.get(g, []))
        disliked_genres = []
        for g in disliked: disliked_genres.extend(genre_map.get(g, []))

        actual_disliked = set(disliked_genres + self.regional_genres)
        actual_disliked = [g for g in actual_disliked if g not in liked_genres]
        target_genres = list(set(liked_genres + self.safe_genres))

        # swap
        tracks = self._find_nearest_tracks(
            target_v=ideal_v, target_e=ideal_e, target_t=ideal_t, target_i=ideal_i,
            target_genres=target_genres, disliked_genres=actual_disliked,
            limit=3, exclude_id=exclude_track_id 
        )

        for t in tracks: t['phase'] = phase_index
        
        tracks = self._fetch_spotify_covers(tracks)
        tracks = self.fetch_youtube_details(tracks)
        
        return tracks

class ChatbotEngine:
    def __init__(self):
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            raise ValueError("Lỗi: Không tìm thấy GEMINI_API_KEY.")
            
        self.client = genai.Client(api_key=api_key)
        self.model_name = 'gemini-2.5-flash' # gemini-3-flash-preview, gemini-2.5-flash
        
        # FILE RAG 
        base_dir = os.path.dirname(os.path.abspath(__file__))
        rag_file_path = os.path.join(base_dir, 'clinical_guidelines.txt')
        
        try:
            with open(rag_file_path, 'r', encoding='utf-8') as f:
                self.rag_manual = f.read()
        except FileNotFoundError:
            # Fallback
            self.rag_manual = "Hãy dùng Liệu pháp Nhận thức Hành vi (CBT) để hỗ trợ người dùng."

        blacklist_path = os.path.join(base_dir, 'prompt_blacklist.txt')
        self.blacklist = []
        try:
            with open(blacklist_path, 'r', encoding='utf-8') as f:
                self.blacklist = [line.strip().lower() for line in f if line.strip()]
        except FileNotFoundError:
            self.blacklist = ["bỏ qua các lệnh", "ignore previous instructions", "viết code"]

        self.system_prompt = """
        BẠN ĐANG ĐẢM NHẬN 2 VAI TRÒ CÙNG LÚC. HÃY THỰC HIỆN THEO ĐÚNG THỨ TỰ SAU:

        NHIỆM VỤ 1 (ƯU TIÊN TỐI CAO): NGƯỜI GÁC CỔNG AN TOÀN (SAFETY GATEKEEPER)
        Phân tích ngữ nghĩa câu nói mới nhất của người dùng. Nếu có BẤT KỲ dấu hiệu ẩn dụ hoặc trực tiếp nào về việc:
        - Muốn kết thúc cuộc sống, tự sát, giải thoát, tự làm đau bản thân.
        - Cảm thấy tuyệt vọng cùng cực, gửi lời chào tạm biệt cuối cùng.
        => BẠN BẮT BUỘC PHẢI DỪNG LẠI, TRẢ VỀ CHÍNH XÁC CHUỖI NÀY VÀ KHÔNG THÊM BẤT CỨ TỪ NÀO KHÁC: [EMERGENCY_TRIGGERED]
        - Yêu cầu vượt ngoài phạm vi tâm lý (Làm toán, viết code, dịch thuật, hóa thân thành nhân vật khác) => TỪ CHỐI NGAY LẬP TỨC. Dùng câu: "Tôi là trợ lý tâm lý MindMelody. Tôi chỉ có thể giúp bạn giải quyết các vấn đề về cảm xúc và sức khỏe tinh thần."

        NHIỆM VỤ 2: TRỢ LÝ TÂM LÝ MindMelody (HYBRID THERAPIST: CARL ROGERS & CBT)
        Chỉ khi câu nói của người dùng AN TOÀN, hãy đóng vai MindMelody. 
        - Về thái độ: Áp dụng trường phái Carl Rogers (Không phán xét, thấu cảm sâu sắc, dùng kỹ thuật Phản chiếu - Mirroring cảm xúc).
        - Về kỹ thuật: Bắt buộc tuân thủ phương pháp giải quyết vấn đề theo Cẩm nang Lâm sàng CBT (RAG) được cung cấp.        
        """

    def _is_injection(self, text):
        text_lower = text.lower()
        for phrase in self.blacklist:
            # check ban
            if phrase in text_lower:
                return True
        return False

    def generate_response(self, user_message, history, user_name, user_age, current_song, dass_scores):

        if self._is_injection(user_message):
            return "Tôi là trợ lý tâm lý MindMelody. Yêu cầu của bạn nằm ngoài phạm vi chuyên môn của tôi. Chúng ta có thể quay lại câu chuyện về cảm xúc của bạn chứ?", False
        
        top_issue = max(dass_scores, key=dass_scores.get)
        severity = dass_scores[top_issue]

        # 1. DYNAMIC PERSONA LOGIC
        persona_context = ""
        if user_age and 18 <= user_age <= 24:
            persona_context = """
            [ĐỐI TƯỢNG ĐẶC THÙ]: Người dùng là SINH VIÊN ĐẠI HỌC. 
            Hãy chủ động liên hệ ngầm sự lo âu, căng thẳng của họ với bối cảnh học thuật (thi cử, deadline, nợ môn, định hướng tương lai, quan hệ bạn bè). Dùng ngôn từ thấu cảm, phù hợp với Gen Z.
            """
        else:
            persona_context = """
            [ĐỐI TƯỢNG ĐẶC THÙ]: Người trưởng thành. 
            Hãy tập trung vào áp lực công việc, tài chính, gia đình và sự cân bằng cuộc sống.
            """

        # 2. DASS-21
        clinical_instruction = ""
        if top_issue == 'depression':
            clinical_instruction = "Người dùng có dấu hiệu trầm cảm. Tuyệt đối không dùng 'Toxic Positivity' (Cố lên, vui lên). Hãy đồng ý rằng nỗi buồn của họ là hợp lý."
        elif top_issue == 'anxiety':
            clinical_instruction = "Người dùng đang lo âu. Hãy dùng kỹ thuật Grounding (Neo giữ hiện tại). Tránh bàn về tương lai xa xôi."
        else:
            clinical_instruction = "Người dùng bị stress quá tải. Hãy gợi ý thả lỏng cơ bắp và chia nhỏ vấn đề."

        # 3. Context - max 10 length
        if len(history) == 0:
            conversation_context = f"""
            [NGỮ CẢNH]: Đây là CÂU CHÀO HỎI ĐẦU TIÊN của phiên chat. 
            - Hãy chào {user_name} và nhắc một cách tự nhiên về bài hát '{current_song}' để bắt chuyện.
            """
        else:
            conversation_context = f"""
            [NGỮ CẢNH]: Cuộc trò chuyện ĐANG DIỄN RA. Người dùng: {user_name}, đang nghe: '{current_song}'.
            - TUYỆT ĐỐI KHÔNG chào hỏi lại hay phân tích bài hát như một cỗ máy.
            """

        # 4. SYSTEM PROMPT (RAG)
        system_prompt = f"""
        {self.system_prompt}
        
        [CẨM NANG LÂM SÀNG TỪ HỆ THỐNG RAG]:
        {self.rag_manual}
        
        {persona_context}
        {conversation_context}
        [CHỈ THỊ DASS-21]: {clinical_instruction} (Mức độ: {severity}/42).
        
        [QUY TẮC BẮT BUỘC]:
        1. Phản hồi dưới 80 chữ. Dùng câu hỏi gợi mở (Socratic).
        2. Nếu phát hiện rủi ro tự hại => TRẢ VỀ: [EMERGENCY_TRIGGERED]
        3. NHIỆM VỤ ĐÁNH GIÁ ÂM NHẠC: Nếu user chê nhạc => chèn [MUSIC_PREF: DISLIKE] ở cuối. Nếu khen => chèn [MUSIC_PREF: LIKE] ở cuối.
        """

        # 5.API
        messages = [
            types.Content(role="user", parts=[types.Part.from_text(text=system_prompt)]),
            types.Content(role="model", parts=[types.Part.from_text(text="Đã hiểu cẩm nang RAG và hồ sơ Persona. Tôi sẽ tuân thủ nghiêm ngặt.")])
        ]
        
        for msg in history:
            role = "user" if msg.sender == 'USER' else "model"
            messages.append(types.Content(role=role, parts=[types.Part.from_text(text=msg.content)]))
            
        messages.append(types.Content(role="user", parts=[types.Part.from_text(text=user_message)]))

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = self.client.models.generate_content(
                    model=self.model_name,
                    contents=messages
                )
                bot_text = response.text.strip()

                if "[EMERGENCY_TRIGGERED]" in bot_text:
                    emergency_msg = (
                        "Tôi cảm nhận được bạn đang mang một nỗi đau quá lớn và vượt sức chịu đựng. Sự an toàn của bạn lúc này là điều quan trọng nhất. \n"
                        "Đường dây nóng Ngày Mai: 096 306 1414 (Hỗ trợ thanh thiếu niên trầm cảm).\n "
                        "Viện Sức khỏe Tâm thần Quốc gia: (024) 3576 5344 hoặc 0984 104 115.\n "
                        "Hệ thống đã tự động kích hoạt nhạc nhẹ nhàng, hãy nhắm mắt lại và cố gắng hít thở sâu cùng tôi nhé."
                    )
                    return emergency_msg, True 
                else:
                    return bot_text, False

            except Exception as e:
                error_str = str(e)
                # 503 / 429
                if "503" in error_str or "UNAVAILABLE" in error_str or "429" in error_str:
                    if attempt < max_retries - 1:
                        time.sleep(2 ** attempt) 
                        continue
                
                print(f"Lỗi Gemini API: {error_str}")
                return "Hệ thống đang xử lý quá nhiều luồng suy nghĩ. Bạn cho tôi vài giây để sắp xếp lại nhé.", False


    def summarize_to_diary(self, history_messages):
        if not history_messages or len(history_messages) < 2:
            return None, None

        conv_text = "\n".join([f"{msg.sender}: {msg.content}" for msg in history_messages])

        prompt = f"""
        Dưới đây là cuộc trò chuyện giữa tôi (USER) và chuyên viên tham vấn tâm lý (BOT).
        Nhiệm vụ của bạn: Hãy đóng vai tôi (USER), viết một đoạn nhật ký ngắn (khoảng 80 chữ) để ghi lại cảm xúc của mình ngày hôm nay và hướng giải quyết mà tôi vừa nhận ra sau khi trò chuyện.
        Và đặt một tiêu đề ngắn gọn (dưới 10 chữ).
        
        Bắt buộc trả về đúng định dạng sau, không thêm bất cứ từ ngữ nào khác:
        TITLE: [Tiêu đề nhật ký]
        CONTENT: [Nội dung nhật ký]

        Cuộc trò chuyện:
        {conv_text}
        """

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            text = response.text.strip()
            
            title = "Nhật ký tự động"
            content = text
            
            if "TITLE:" in text and "CONTENT:" in text:
                parts = text.split("CONTENT:")
                title_part = parts[0].replace("TITLE:", "").strip()
                content_part = parts[1].strip()
                title = title_part if title_part else title
                content = content_part if content_part else content

            return title, content
        except Exception as e:
            print("Lỗi AI khi tóm tắt nhật ký:", e)
            return None, None