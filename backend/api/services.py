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
from .localization import (
    SUPPORTED_LANGS, DEFAULT_LANG, NO_SONG_VALUES, normalize_lang, tr,
)

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

    def generate_therapy_playlist(self, user, dass_result, lang=DEFAULT_LANG):
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
            conflict_msg = tr(lang, 'conflict_message')

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
                print(f"YouTube search error for {track['title']}: {e}")
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
            raise ValueError("GEMINI_API_KEY not found.")

        self.client = genai.Client(api_key=api_key)
        self.model_name = 'gemini-3-flash-preview' # gemini-3-flash-preview, gemini-2.5-flash

        base_dir = os.path.dirname(os.path.abspath(__file__))

        # FILE RAG: one clinical guide per language (clinical_guidelines_en.txt / _vi.txt)
        self.rag_manuals = {lang: self._load_rag_manual(base_dir, lang) for lang in SUPPORTED_LANGS}

        # The blacklist is language-agnostic on purpose: injection phrases are blocked
        # whatever the UI language is (a user can type English in the VI UI and vice versa).
        blacklist_path = os.path.join(base_dir, 'prompt_blacklist.txt')
        self.blacklist = []
        try:
            with open(blacklist_path, 'r', encoding='utf-8') as f:
                self.blacklist = [line.strip().lower() for line in f if line.strip()]
        except FileNotFoundError:
            self.blacklist = ["bỏ qua các lệnh", "ignore previous instructions", "viết code"]

        # Whole-phrase matching: "react as" no longer matches a phrase like "act as".
        self._blacklist_patterns = [
            re.compile(r'(?<!\w)' + re.escape(phrase) + r'(?!\w)')
            for phrase in self.blacklist
        ]

    @staticmethod
    def _load_rag_manual(base_dir, lang):
        candidates = [f'clinical_guidelines_{lang}.txt']
        if lang == 'vi':
            candidates.append('clinical_guidelines.txt')  # legacy file name
        for name in candidates:
            try:
                with open(os.path.join(base_dir, name), 'r', encoding='utf-8') as f:
                    return f.read()
            except FileNotFoundError:
                continue
        return tr(lang, 'rag_fallback')

    @staticmethod
    def _clean(value, max_len):
        # user-controlled strings (song title, name) go into the prompt: flatten and cap them
        return ' '.join(str(value or '').split())[:max_len]

    def _is_injection(self, text):
        text_lower = text.lower()
        return any(pattern.search(text_lower) for pattern in self._blacklist_patterns)

    def generate_response(self, user_message, history, user_name, user_age, current_song, dass_scores, lang=DEFAULT_LANG):
        lang = normalize_lang(lang)

        if self._is_injection(user_message):
            return tr(lang, 'injection_reply'), False

        top_issue = max(dass_scores, key=dass_scores.get)
        severity = dass_scores[top_issue]

        # 1. DYNAMIC PERSONA LOGIC
        if user_age and 18 <= user_age <= 24:
            persona_context = tr(lang, 'persona_student')
        else:
            persona_context = tr(lang, 'persona_adult')

        # 2. DASS-21
        if top_issue == 'depression':
            clinical_instruction = tr(lang, 'clinical_depression')
        elif top_issue == 'anxiety':
            clinical_instruction = tr(lang, 'clinical_anxiety')
        else:
            clinical_instruction = tr(lang, 'clinical_stress')

        # 3. Context - max 10 length
        song = self._clean(current_song, 120)
        if song.lower() in NO_SONG_VALUES:
            song_instruction = tr(lang, 'song_none')
        else:
            song_instruction = tr(lang, 'song_known', song=song)

        name = self._clean(user_name, 60)
        if len(history) == 0:
            conversation_context = tr(lang, 'context_first', user_name=name, song_instruction=song_instruction)
        else:
            conversation_context = tr(lang, 'context_ongoing', user_name=name, song_instruction=song_instruction)

        # 4. SYSTEM PROMPT (RAG)
        system_prompt = "\n\n".join([
            tr(lang, 'system_prompt'),
            tr(lang, 'rag_header') + "\n" + self.rag_manuals[lang],
            persona_context,
            conversation_context,
            tr(lang, 'dass_directive', clinical=clinical_instruction, severity=severity),
            tr(lang, 'rules'),
        ])

        # 5.API
        messages = [
            types.Content(role="user", parts=[types.Part.from_text(text=system_prompt)]),
            types.Content(role="model", parts=[types.Part.from_text(text=tr(lang, 'ack'))])
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
                    return tr(lang, 'emergency_reply'), True
                else:
                    return bot_text, False

            except Exception as e:
                error_str = str(e)
                # 503 / 429
                if "503" in error_str or "UNAVAILABLE" in error_str or "429" in error_str:
                    if attempt < max_retries - 1:
                        time.sleep(2 ** attempt)
                        continue

                print(f"Gemini API error: {error_str}")
                return tr(lang, 'error_reply'), False


    def summarize_to_diary(self, history_messages, lang=DEFAULT_LANG):
        lang = normalize_lang(lang)
        if not history_messages or len(history_messages) < 2:
            return None, None

        conv_text = "\n".join([f"{msg.sender}: {msg.content}" for msg in history_messages])
        prompt = tr(lang, 'diary_prompt', conversation=conv_text)

        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt
            )
            text = response.text.strip()

            title = tr(lang, 'diary_default_title')
            content = text

            if "TITLE:" in text and "CONTENT:" in text:
                parts = text.split("CONTENT:")
                title_part = parts[0].replace("TITLE:", "").strip()
                content_part = parts[1].strip()
                title = title_part if title_part else title
                content = content_part if content_part else content

            return title, content
        except Exception as e:
            print("AI error while summarizing diary:", e)
            return None, None