from django.core.management.base import BaseCommand
from api.models import Track

class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        therapy_tracks = [
            # ==========================================
            # R1: DOWN-REGULATION TARGETS (Dành cho Lo âu & Căng thẳng)
            # Cơ sở lý thuyết: Điều hòa thần kinh phó giao cảm (Parasympathetic nervous system).
            # Đặc tả: 50-70 BPM, Legato (liên tiếp, mượt mà), thiếu vắng nhịp gõ dồn dập.
            # 1. Lewis-Hodgson, D. (2011). "Sound Therapy and Anxiety Reduction." Mindlab International.
            # 2. Trappe, H. J. (2010). "The effects of music on the cardiovascular system and cardiovascular health." Heart.
            # ==========================================
            {"spotify_id": "sos_calm_01", "title": "Weightless", "artist": "Marconi Union", "youtube_id": "UfcAVejslrU", "duration": "8:00", "valence": 0.4, "energy": 0.1, "tempo": 60.0},
            {"spotify_id": "sos_calm_02", "title": "Electra", "artist": "Airstream", "youtube_id": "mXwFkHlJ5rA", "duration": "6:15", "valence": 0.5, "energy": 0.2, "tempo": 65.0},
            {"spotify_id": "sos_calm_03", "title": "Mellomaniac (Chill Out Mix)", "artist": "DJ Shah", "youtube_id": "5YQO1kY8yqU", "duration": "5:30", "valence": 0.5, "energy": 0.25, "tempo": 60.0},
            {"spotify_id": "sos_calm_04", "title": "Watermark", "artist": "Enya", "youtube_id": "NO5tb20qQnA", "duration": "2:25", "valence": 0.3, "energy": 0.15, "tempo": 65.0},
            {"spotify_id": "sos_calm_05", "title": "Strawberry Swing", "artist": "Coldplay", "youtube_id": "2niQPyZfykA", "duration": "4:09", "valence": 0.6, "energy": 0.3, "tempo": 70.0},
            {"spotify_id": "sos_calm_06", "title": "Please Don't Go", "artist": "Barcelona", "youtube_id": "CO1dDlyh_XQ", "duration": "3:17", "valence": 0.4, "energy": 0.2, "tempo": 65.0},
            {"spotify_id": "sos_calm_07", "title": "Pure Shores (Instrumental)", "artist": "All Saints", "youtube_id": "xG2QvH1M-y0", "duration": "4:28", "valence": 0.5, "energy": 0.3, "tempo": 68.0},
            # Trappe (2010) - Cardiovascular health synchronization
            {"spotify_id": "sos_calm_08", "title": "Air on the G String", "artist": "J.S. Bach", "youtube_id": "GMkmQlfOJDk", "duration": "5:00", "valence": 0.5, "energy": 0.1, "tempo": 60.0},
            {"spotify_id": "sos_calm_09", "title": "Piano Concerto No. 21 in C major (Andante)", "artist": "W.A. Mozart", "youtube_id": "df-eLzao63I", "duration": "7:00", "valence": 0.6, "energy": 0.15, "tempo": 60.0},
            {"spotify_id": "sos_calm_10", "title": "Gymnopédie No.1", "artist": "Erik Satie", "youtube_id": "S-Xm7s9eGxU", "duration": "3:20", "valence": 0.4, "energy": 0.1, "tempo": 55.0},
            {"spotify_id": "sos_calm_11", "title": "Spiegel im Spiegel", "artist": "Arvo Pärt", "youtube_id": "TJ6Mzvh3XCc", "duration": "8:30", "valence": 0.3, "energy": 0.05, "tempo": 50.0},
            {"spotify_id": "sos_calm_12", "title": "1/1 (Music for Airports)", "artist": "Brian Eno", "youtube_id": "vNwYtllyt3Q", "duration": "16:30", "valence": 0.4, "energy": 0.05, "tempo": 50.0},
            {"spotify_id": "sos_calm_13", "title": "The Blue Notebooks", "artist": "Max Richter", "youtube_id": "8rmWl8x9iI0", "duration": "2:00", "valence": 0.3, "energy": 0.1, "tempo": 55.0},
            {"spotify_id": "sos_calm_14", "title": "Weightless (Part 2)", "artist": "Marconi Union", "youtube_id": "qYnA9wWFHLI", "duration": "5:00", "valence": 0.4, "energy": 0.1, "tempo": 60.0},
            {"spotify_id": "sos_calm_15", "title": "Nocturne Op. 9 No. 2", "artist": "Frederic Chopin", "youtube_id": "9E6b3swbnWg", "duration": "4:30", "valence": 0.4, "energy": 0.15, "tempo": 60.0},
            {"spotify_id": "sos_calm_16", "title": "Oltremare", "artist": "Ludovico Einaudi", "youtube_id": "R8MzHdW0jKw", "duration": "5:50", "valence": 0.4, "energy": 0.25, "tempo": 60.0},
            {"spotify_id": "sos_calm_17", "title": "Clair de Lune", "artist": "Claude Debussy", "youtube_id": "CvFH_6DNRCY", "duration": "5:30", "valence": 0.4, "energy": 0.1, "tempo": 60.0},
            {"spotify_id": "sos_calm_18", "title": "Nuvole Bianche", "artist": "Ludovico Einaudi", "youtube_id": "QwNIcxEeB8k", "duration": "5:58", "valence": 0.3, "energy": 0.15, "tempo": 65.0},
            {"spotify_id": "sos_calm_19", "title": "River Flows In You", "artist": "Yiruma", "youtube_id": "NPBCbTZWnq0", "duration": "3:08", "valence": 0.4, "energy": 0.2, "tempo": 65.0},
            {"spotify_id": "sos_calm_20", "title": "Moonlight Sonata (1st Mvt)", "artist": "Ludwig van Beethoven", "youtube_id": "nze9DeEOO90", "duration": "6:00", "valence": 0.2, "energy": 0.1, "tempo": 55.0},
            {"spotify_id": "sos_calm_21", "title": "Adagio for Strings", "artist": "Samuel Barber", "youtube_id": "23z4zduN_IQ", "duration": "8:00", "valence": 0.2, "energy": 0.1, "tempo": 50.0},
            {"spotify_id": "sos_calm_22", "title": "Canon in D", "artist": "Johann Pachelbel", "youtube_id": "NlprozGcs80", "duration": "5:00", "valence": 0.5, "energy": 0.2, "tempo": 70.0},
            {"spotify_id": "sos_calm_23", "title": "The Lark Ascending", "artist": "Ralph Vaughan Williams", "youtube_id": "HWPRIgO0BvE", "duration": "15:00", "valence": 0.3, "energy": 0.15, "tempo": 60.0},
            {"spotify_id": "sos_calm_24", "title": "Experience", "artist": "Ludovico Einaudi", "youtube_id": "hN_q-_lNv4U", "duration": "5:15", "valence": 0.4, "energy": 0.3, "tempo": 75.0},
            {"spotify_id": "sos_calm_25", "title": "Morning Promenade", "artist": "Edvard Grieg", "youtube_id": "O2gDFJWhXp8", "duration": "4:00", "valence": 0.5, "energy": 0.2, "tempo": 60.0},
            {"spotify_id": "sos_calm_26", "title": "Gymnopédie No. 2", "artist": "Erik Satie", "youtube_id": "J4Ksz9cfbmw", "duration": "3:00", "valence": 0.4, "energy": 0.1, "tempo": 55.0},
            {"spotify_id": "sos_calm_27", "title": "Gymnopédie No. 3", "artist": "Erik Satie", "youtube_id": "BvrLaHAkGbE", "duration": "2:30", "valence": 0.4, "energy": 0.1, "tempo": 55.0},
            # ==========================================
            # R2: UP-REGULATION TARGETS (Dành cho Trầm Cảm)
            # Cơ sở lý thuyết: Musical Mood Induction Procedure (MMIP) tạo hưng phấn (Elation).
            # Đặc tả: >100 BPM, Âm giai trưởng (Major key), năng lượng cao, dao động cường độ mạnh.
            # 1. Västfjäll, D. (2002). "Emotion induction through music: A review of the musical mood induction procedure." Musicae Scientiae.
            # 2. Karageorghis, C. I., & Priest, D. L. (2012). "Music in the exercise domain..." (Ergogenic effects / Arousal up-regulation).
            # ==========================================
            {"spotify_id": "sos_active_01", "title": "Spring (The Four Seasons) - 1st Movement", "artist": "Antonio Vivaldi", "youtube_id": "mFWQgxXM_b8", "duration": "3:30", "valence": 0.85, "energy": 0.7, "tempo": 115.0},
            {"spotify_id": "sos_active_02", "title": "Overture to The Marriage of Figaro", "artist": "W.A. Mozart", "youtube_id": "ikbKX1M_R8k", "duration": "4:20", "valence": 0.9, "energy": 0.8, "tempo": 130.0},
            {"spotify_id": "sos_active_03", "title": "Jupiter, the Bringer of Jollity", "artist": "Gustav Holst", "youtube_id": "Gu77Vtja30c", "duration": "8:00", "valence": 0.8, "energy": 0.8, "tempo": 120.0},
            {"spotify_id": "sos_active_04", "title": "Brandenburg Concerto No. 3 in G Major", "artist": "J.S. Bach", "youtube_id": "Xq2WTXtKurk", "duration": "5:30", "valence": 0.85, "energy": 0.75, "tempo": 115.0},
            {"spotify_id": "sos_active_05", "title": "Ode to Joy (Symphony No. 9)", "artist": "Ludwig van Beethoven", "youtube_id": "Wod-MutcoQM", "duration": "6:00", "valence": 0.9, "energy": 0.8, "tempo": 115.0},
            {"spotify_id": "sos_active_06", "title": "Hoppípolla", "artist": "Sigur Rós", "youtube_id": "mZTb8WxEW78", "duration": "4:30", "valence": 0.8, "energy": 0.8, "tempo": 115.0},
            {"spotify_id": "sos_active_07", "title": "William Tell Overture (Finale)", "artist": "Gioachino Rossini", "youtube_id": "Y9R5n7vjR0Q", "duration": "3:10", "valence": 0.9, "energy": 0.9, "tempo": 135.0},
            {"spotify_id": "sos_active_08", "title": "The Ecstasy of Gold", "artist": "Ennio Morricone", "youtube_id": "PYI09PMNazs", "duration": "3:20", "valence": 0.75, "energy": 0.8, "tempo": 110.0},
            {"spotify_id": "sos_active_09", "title": "Chariots of Fire", "artist": "Vangelis", "youtube_id": "CSav51fVlKU", "duration": "3:30", "valence": 0.8, "energy": 0.7, "tempo": 105.0},
            {"spotify_id": "sos_active_10", "title": "Outro", "artist": "M83", "youtube_id": "yIEh4I_F3bA", "duration": "4:07", "valence": 0.8, "energy": 0.85, "tempo": 120.0},
            {"spotify_id": "sos_active_11", "title": "The Magnificent Seven Theme", "artist": "Elmer Bernstein", "youtube_id": "8XDB7GMnbUQ", "duration": "5:30", "valence": 0.85, "energy": 0.8, "tempo": 125.0},
            {"spotify_id": "sos_active_12", "title": "Rhapsody in Blue (Finale)", "artist": "George Gershwin", "youtube_id": "eFHdRkeEnpM", "duration": "4:00", "valence": 0.8, "energy": 0.8, "tempo": 120.0},
            {"spotify_id": "sos_active_13", "title": "First Step (Interstellar) - Major Key Version", "artist": "Hans Zimmer", "youtube_id": "4y33h81phKU", "duration": "1:47", "valence": 0.7, "energy": 0.65, "tempo": 105.0},
            {"spotify_id": "sos_active_14", "title": "Now We Are Free", "artist": "Hans Zimmer", "youtube_id": "NBE-uBgtINg", "duration": "4:14", "valence": 0.75, "energy": 0.7, "tempo": 105.0},
            {"spotify_id": "sos_active_15", "title": "A Beautiful Mine", "artist": "RJD2", "youtube_id": "W7XEQf5XwU8", "duration": "5:29", "valence": 0.7, "energy": 0.75, "tempo": 110.0},
            {"spotify_id": "sos_active_16", "title": "Your Hand In Mine", "artist": "Explosions In The Sky", "youtube_id": "cdiwcjzi1b8", "duration": "8:17", "valence": 0.7, "energy": 0.8, "tempo": 110.0},
            {"spotify_id": "sos_active_17", "title": "Flying Theme (E.T.)", "artist": "John Williams", "youtube_id": "O15x-B8PgeE", "duration": "3:45", "valence": 0.8, "energy": 0.7, "tempo": 115.0},
            {"spotify_id": "sos_active_18", "title": "Pomp and Circumstance March No. 1", "artist": "Edward Elgar", "youtube_id": "moL4MkJ-aLk", "duration": "6:00", "valence": 0.8, "energy": 0.75, "tempo": 110.0},
            {"spotify_id": "sos_active_19", "title": "Awake", "artist": "Tycho", "youtube_id": "7xF0vN-Gk2k", "duration": "4:43", "valence": 0.75, "energy": 0.75, "tempo": 110.0},
            {"spotify_id": "sos_active_20", "title": "A Walk", "artist": "Tycho", "youtube_id": "mehLx_Fjv_c", "duration": "5:16", "valence": 0.7, "energy": 0.7, "tempo": 105.0},
            {"spotify_id": "sos_active_21", "title": "Eine kleine Nachtmusik (Allegro)", "artist": "W.A. Mozart", "youtube_id": "nPbxTrPcm3o", "duration": "5:50", "valence": 0.8, "energy": 0.7, "tempo": 120.0},
            {"spotify_id": "sos_active_22", "title": "Carmen Overture", "artist": "Georges Bizet", "youtube_id": "pmuFOuh3QHs", "duration": "2:20", "valence": 0.85, "energy": 0.8, "tempo": 125.0},
            {"spotify_id": "sos_active_23", "title": "Ride of the Valkyries", "artist": "Richard Wagner", "youtube_id": "GGU1P6lBW6Q", "duration": "5:20", "valence": 0.7, "energy": 0.9, "tempo": 130.0},
            {"spotify_id": "sos_active_24", "title": "Symphony No. 5 (1st Mvt)", "artist": "Ludwig van Beethoven", "youtube_id": "jv2WJM5OUXI", "duration": "7:15", "valence": 0.6, "energy": 0.8, "tempo": 108.0},
            {"spotify_id": "sos_active_25", "title": "Radetzky March", "artist": "Johann Strauss I", "youtube_id": "eEEUIAYpWvM", "duration": "3:00", "valence": 0.9, "energy": 0.85, "tempo": 115.0},
            {"spotify_id": "sos_active_26", "title": "Hungarian Dance No. 5", "artist": "Johannes Brahms", "youtube_id": "3X9LvC9WkkQ", "duration": "2:40", "valence": 0.85, "energy": 0.8, "tempo": 120.0},
            {"spotify_id": "sos_active_27", "title": "Symphony No. 9 (Scherzo)", "artist": "Ludwig van Beethoven", "youtube_id": "p5favl2Qtx0", "duration": "10:00", "valence": 0.7, "energy": 0.85, "tempo": 116.0}
        ]

        count = 0
        for track_data in therapy_tracks:
            track, created = Track.objects.update_or_create(
                spotify_id=track_data['spotify_id'],
                defaults=track_data
            )
            count += 1
            
        self.stdout.write(self.style.SUCCESS(f'--- DONE! Đã nạp thành công {count} Kích thích Âm thanh  ---'))