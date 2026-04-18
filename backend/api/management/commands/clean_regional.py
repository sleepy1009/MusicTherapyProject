from django.core.management.base import BaseCommand
from api.models import SpotifyTrack

class Command(BaseCommand):
    help = 'Xóa triệt để các bài hát địa phương bị trùng lặp thể loại'

    def handle(self, *args, **kwargs):
        regional_genres = [
            'bollywood', 'indian', 'latin', 'latino', 'spanish', 'salsa', 'tango', 'samba', 
            'j-pop', 'j-rock', 'k-pop', 'mandopop', 'cantopop', 'malay', 'turkish', 'iranian', 
            'french', 'german', 'swedish', 'brazil', 'reggaeton', 'afrobeat', 'forro', 'pagode', 'sertanejo'
        ]

        self.stdout.write("Bắt đầu quét dữ liệu...")

        # 1. Lấy danh sách (track_name, artists) của các bài hát dính tag địa phương
        bad_tracks_query = SpotifyTrack.objects.filter(genre__in=regional_genres).values_list('track_name', 'artists')
        
        # Dùng set để loại bỏ trùng lặp trong chính danh sách đen
        bad_tracks_set = set(bad_tracks_query)
        self.stdout.write(f"Phát hiện {len(bad_tracks_set)} bài hát gốc thuộc nhóm địa phương.")

        # 2. Quét và xóa toàn bộ các dòng (kể cả tag an toàn) trùng tên & nghệ sĩ
        deleted_count = 0
        for name, artist in bad_tracks_set:
            tracks_to_delete = SpotifyTrack.objects.filter(track_name=name, artists=artist)
            count, _ = tracks_to_delete.delete()
            deleted_count += count

        self.stdout.write(self.style.SUCCESS(f"Đã dọn dẹp sạch sẽ {deleted_count} dòng dữ liệu rác!"))