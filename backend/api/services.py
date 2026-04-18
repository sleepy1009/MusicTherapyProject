import math
import random
from ytmusicapi import YTMusic
from .models import SpotifyTrack
import requests
from concurrent.futures import ThreadPoolExecutor

class MusicTherapyEngine:
    def __init__(self):
        self.ytmusic = YTMusic()
        # Thể loại Trị liệu chuẩn
        self.safe_genres = ['acoustic', 'piano', 'ambient', 'classical', 'lofi', 'chill', 'sleep']
        # Thể loại Dễ gây kích động
        self.high_energy_genres = ['edm', 'rock', 'rap', 'metal', 'dance', 'hardstyle']
        # Thể loại Nước ngoài/Địa phương (Tự động loại bỏ trừ khi user thích)
        self.regional_genres = [
            'bollywood', 'indian', 'latin', 'latino', 'spanish', 'salsa', 'tango', 'samba', 
            'j-pop', 'j-rock', 'k-pop', 'mandopop', 'cantopop', 'malay', 'turkish', 'iranian', 
            'french', 'german', 'swedish', 'brazil', 'reggaeton', 'afrobeat'
        ]

    def generate_therapy_playlist(self, user, dass_result):
        # 1. BỆNH LÝ CHÍNH
        s = dass_result.stress_score
        a = dass_result.anxiety_score
        d = dass_result.depression_score
        
        dominant = 'A' 
        if d >= a and d >= s: dominant = 'D'
        if s > a and s > d: dominant = 'S'

        # 2. VECTOR ĐÍCH 
        # Format: [(valence, energy, tempo, instrumentalness)]
        if dominant == 'D': 
            iso_phases = [
                (0.3, 0.3, 80, 0.0), (0.35, 0.4, 85, 0.0), # 1,2: Đồng cảm
                (0.4, 0.5, 90, 0.0), (0.5, 0.6, 95, 0.0),  # 3,4: Chuyển giao
                (0.6, 0.7, 100, 0.0), (0.65, 0.75, 105, 0.0), (0.7, 0.8, 110, 0.0) # 5,6,7: Đích
            ]
        elif dominant == 'A': 
            iso_phases = [
                (0.5, 0.5, 90, 0.2), (0.5, 0.4, 85, 0.3),  # 1,2
                (0.5, 0.3, 80, 0.5), (0.55, 0.25, 75, 0.6),# 3,4
                (0.6, 0.2, 70, 0.7), (0.6, 0.15, 65, 0.8), (0.6, 0.1, 60, 0.9) # 5,6,7 (Ép nhạc không lời)
            ]
        else: 
            iso_phases = [
                (0.4, 0.5, 90, 0.3), (0.45, 0.45, 85, 0.4), # 1,2
                (0.5, 0.4, 80, 0.5), (0.55, 0.35, 75, 0.6), # 3,4
                (0.6, 0.3, 70, 0.7), (0.6, 0.25, 65, 0.8), (0.6, 0.2, 60, 0.9) # 5,6,7
            ]

        # BƯỚC 3: XỬ LÝ SỞ THÍCH & VĂN HÓA
        # 3.1. Từ điển dịch Nhóm thể loại (Frontend) sang Thể loại thật (Database)
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

        # 3.2. Lấy dữ liệu thô từ User
        liked_groups = user.music_preferences.get('liked_genres', [])
        disliked_groups = user.music_preferences.get('disliked_genres', [])
        
        # 3.3. Bung mảng (Expand) thành các thể loại thực tế
        liked = []
        for g in liked_groups:
            liked.extend(genre_map.get(g, []))
            
        disliked = []
        for g in disliked_groups:
            disliked.extend(genre_map.get(g, []))
        
        # Tạo Blacklist (Gộp Disliked của user với Regional)
        actual_disliked = set(disliked + self.regional_genres)
        # Nếu user thực sự thích K-pop, bỏ K-pop ra khỏi blacklist
        actual_disliked = [g for g in actual_disliked if g not in liked]

        # Luôn luôn TRỘN nhạc trị liệu vào cùng với sở thích của user
        target_genres = list(set(liked + self.safe_genres))

        # Kiểm tra xung đột
        has_conflict = False
        conflict_msg = ""
        if dominant in ['A', 'S']:
            overlap_high = any(g in self.high_energy_genres for g in liked)
            if overlap_high:
                has_conflict = True
                conflict_msg = f"Tôi biết bạn thích nhạc mạnh (như EDM/Rock), nhưng để làm dịu nhịp tim hiện tại, hệ thống đã đan xen thêm các bản Acoustic và Piano. Bạn hãy thử thả lỏng nhé."

        # 4. CHẤM ĐIỂM BÀI HÁT TRONG DB
        playlist = []
        for phase_idx, (ideal_v, ideal_e, ideal_t, ideal_i) in enumerate(iso_phases):
            tracks = self._find_nearest_tracks(
                target_v=ideal_v, target_e=ideal_e, target_t=ideal_t, target_i=ideal_i,
                target_genres=target_genres, disliked_genres=actual_disliked,
                limit=9  
            )
            for t in tracks:
                t['phase'] = phase_idx + 1 # Gắn nhãn từ 1 đến 7
            playlist.extend(tracks)

        playlist = self._fetch_spotify_covers(playlist)

        return {
            "has_conflict": has_conflict,
            "conflict_message": conflict_msg,
            "recommended_tracks": playlist
        }

        """
        # 5. TÌM YOUTUBE ID
        final_playlist = self._attach_youtube_ids(playlist)

        return {
            "has_conflict": has_conflict,
            "conflict_message": conflict_msg,
            "recommended_tracks": final_playlist,
            "fallback_tracks": [] # Tạm ẩn fallback đi để tránh rối
        }
        """

    def _find_nearest_tracks(self, target_v, target_e, target_t, target_i, target_genres, disliked_genres, limit=2, exclude_id=None):
        queryset = SpotifyTrack.objects.exclude(genre__in=disliked_genres)
        if exclude_id:
            queryset = queryset.exclude(track_id=exclude_id)
        if target_genres:
            queryset = queryset.filter(genre__in=target_genres)
            
        # Lấy 200 bài ngẫu nhiên để chấm điểm
        candidates = list(queryset.order_by('?')[:200])
        
        if not candidates:
            candidates = list(SpotifyTrack.objects.exclude(genre__in=disliked_genres).order_by('?')[:200])

        scored_tracks = []
        for track in candidates:
            distance = math.sqrt(
                ((track.valence - target_v) ** 2) * 1.5 +  
                ((track.energy - target_e) ** 2) * 1.2 +
                (((track.tempo - target_t) / 200) ** 2) * 1.0 +
                ((track.instrumentalness - target_i) ** 2) * 2.0
            )
            scored_tracks.append((distance, track))

        scored_tracks.sort(key=lambda x: x[0])
        best_tracks = [t[1] for t in scored_tracks[:limit]]

        result = []
        for track in best_tracks:
            result.append({
                "id": track.track_id, 
                "title": track.track_name,
                "artist": track.artists,
                "genre": track.genre,
                "image": "https://images.unsplash.com/photo-1614680376593-902f74a5cecb?w=500&q=80",
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
                    # Tận dụng luôn ảnh của YouTube nếu không có ảnh Spotify
                    if 'thumbnails' in search_results[0] and search_results[0]['thumbnails']:
                        track['cover'] = search_results[0]['thumbnails'][-1]['url']
                else:
                    track['youtube_id'] = None
            except Exception as e:
                track['youtube_id'] = None
            return track

        # Dùng 10-15 luồng để tìm YouTube cùng lúc (quá cao dễ bị YouTube block IP)
        with ThreadPoolExecutor(max_workers=15) as executor:
            result_tracks = list(executor.map(search_yt, track_list))
        
        # Chỉ giữ lại những bài tìm thấy link YouTube
        return[t for t in result_tracks if t.get('youtube_id')]
    

    def _fetch_spotify_covers(self, track_list):
        def get_cover(track):
            try:
                # Gọi API công khai của Spotify để lấy ảnh bìa cực nhanh
                res = requests.get(f"https://open.spotify.com/oembed?url=spotify:track:{track['id']}", timeout=2)
                if res.status_code == 200:
                    data = res.json()
                    track['image'] = data.get("thumbnail_url", track['image'])
            except:
                pass 
            return track

        # Dùng 20 luồng chạy song song để lấy ảnh cho 63 bài hát trong ~1 giây
        with ThreadPoolExecutor(max_workers=20) as executor:
            list(executor.map(get_cover, track_list))
        
        return track_list
    
    def fetch_youtube_details(self, tracks):
        def get_yt_info(track):
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
        # 1. Xác định lại bệnh lý
        s = dass_result.stress_score
        a = dass_result.anxiety_score
        d = dass_result.depression_score
        dominant = 'A' 
        if d >= a and d >= s: dominant = 'D'
        if s > a and s > d: dominant = 'S'

        # 2. Lấy đúng thông số của Phase cần đổi (phase_index từ 1 đến 7)
        if dominant == 'D': 
            iso_phases = [(0.3, 0.3, 80, 0.0), (0.35, 0.4, 85, 0.0), (0.4, 0.5, 90, 0.0), (0.5, 0.6, 95, 0.0), (0.6, 0.7, 100, 0.0), (0.65, 0.75, 105, 0.0), (0.7, 0.8, 110, 0.0)]
        elif dominant == 'A': 
            iso_phases = [(0.5, 0.5, 90, 0.2), (0.5, 0.4, 85, 0.3), (0.5, 0.3, 80, 0.5), (0.55, 0.25, 75, 0.6), (0.6, 0.2, 70, 0.7), (0.6, 0.15, 65, 0.8), (0.6, 0.1, 60, 0.9)]
        else: 
            iso_phases = [(0.4, 0.5, 90, 0.3), (0.45, 0.45, 85, 0.4), (0.5, 0.4, 80, 0.5), (0.55, 0.35, 75, 0.6), (0.6, 0.3, 70, 0.7), (0.6, 0.25, 65, 0.8), (0.6, 0.2, 60, 0.9)]

        ideal_v, ideal_e, ideal_t, ideal_i = iso_phases[phase_index - 1]

        # 3. Lấy sở thích
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

        # 4. Tìm 3 bài thay thế
        tracks = self._find_nearest_tracks(
            target_v=ideal_v, target_e=ideal_e, target_t=ideal_t, target_i=ideal_i,
            target_genres=target_genres, disliked_genres=actual_disliked,
            limit=3, exclude_id=exclude_track_id # Bỏ qua bài đang nghe
        )

        for t in tracks: t['phase'] = phase_index
        
        # Lấy ảnh và YouTube ID ngay lập tức để có thể phát luôn
        tracks = self._fetch_spotify_covers(tracks)
        tracks = self.fetch_youtube_details(tracks)
        
        return tracks