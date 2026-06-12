from django.core.management.base import BaseCommand
from api.models import Track

class Command(BaseCommand):
    help = 'cập nhật album_cover từ youtube_id cho các bản nhạc bị thiếu ảnh'

    def handle(self, *args, **kwargs):
        tracks_to_update = Track.objects.filter(
            album_cover__isnull=True
        ).exclude(
            youtube_id__isnull=True
        ).exclude(
            youtube_id__exact=''
        )

        if not tracks_to_update.exists():
            self.stdout.write(self.style.WARNING('Không tìm thấy bản nhạc nào cần cập nhật ảnh bìa.'))
            return

        count = 0
        for track in tracks_to_update:
            # Gắn URL thumbnail mặc định của YouTube
            thumbnail_url = f"https://img.youtube.com/vi/{track.youtube_id}/hqdefault.jpg"
            
            track.album_cover = thumbnail_url
            track.save(update_fields=['album_cover']) 
            count += 1
            
            self.stdout.write(f"Đã cập nhật: {track.title} -> {thumbnail_url}")

        self.stdout.write(self.style.SUCCESS(f'--- THÀNH CÔNG: Đã cập nhật ảnh bìa cho {count} bản nhạc ---'))