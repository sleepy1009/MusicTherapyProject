import time
from django.core.management.base import BaseCommand
from ytmusicapi import YTMusic
from api.models import SpotifyTrack
from concurrent.futures import ThreadPoolExecutor

class Command(BaseCommand):
    help = 'Tự động cào YouTube ID và Ảnh bìa cho kho nhạc SpotifyTrack'

    def handle(self, *args, **kwargs):
        self.stdout.write("Khởi động Bot cào dữ liệu YouTube...")
        ytmusic = YTMusic()
        
        # Chỉ lấy những bài chưa có youtube_id
        tracks_to_process = SpotifyTrack.objects.filter(youtube_id__isnull=True)
        total = tracks_to_process.count()
        
        self.stdout.write(f"Tìm thấy {total} bài hát cần cào data.")
        if total == 0:
            return

        def fetch_single_track(track):
            query = f"{track.track_name} {track.artists} audio"
            try:
                results = ytmusic.search(query, filter="songs", limit=1)
                if results:
                    top = results[0]
                    track.youtube_id = top['videoId']
                    track.duration = top.get('duration', '0:00')
                    if 'thumbnails' in top and top['thumbnails']:
                        track.image = top['thumbnails'][-1]['url']
                    
                    track.save()
                    return f"Thành công: {track.track_name}"
                else:
                    # Đánh dấu "not_found" để lần sau không fetch nữa
                    track.youtube_id = "not_found"
                    track.save()
                    return f"Không thấy: {track.track_name}"
            except Exception as e:
                return f"Lỗi {track.track_name}: {e}"

        count = 0
        with ThreadPoolExecutor(max_workers=5) as executor:
            for result in executor.map(fetch_single_track, tracks_to_process):
                count += 1
                if count % 10 == 0:
                    self.stdout.write(f"Đã xử lý: {count}/{total} bài...")
                time.sleep(0.1)

        self.stdout.write(self.style.SUCCESS('Quá trình Pre-fetch hoàn tất!'))