from django.core.management.base import BaseCommand
from api.models import Track

class Command(BaseCommand):
    help = 'Xóa dữ liệu nhạc trị liệu đã nạp'

    def handle(self, *args, **kwargs):
        deleted_count, _ = Track.objects.filter(spotify_id__startswith="sos_").delete()
        self.stdout.write(self.style.SUCCESS(f'--- Đã xóa {deleted_count} bản nhạc ---'))
