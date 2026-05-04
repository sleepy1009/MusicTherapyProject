import pandas as pd
from django.core.management.base import BaseCommand
from api.models import SpotifyTrack

class Command(BaseCommand):
    help = 'Lọc, làm sạch (nhạc địa phương) và nhập dữ liệu vào Database'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str, help='Đường dẫn tuyệt đối đến file CSV')

    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']
        self.stdout.write("Đang đọc file CSV bằng Pandas...")
        
        try:
            df = pd.read_csv(csv_file)
            self.stdout.write(f"Số lượng ban đầu: {len(df)} dòng.")
            
            self.stdout.write("Đang tiến hành lọc dữ liệu rác và nhạc địa phương...")
            
            # Bỏ bài hát độ phổ biến thấp (< 20)
            df = df[df['popularity'] >= 20]
            # Loại bỏ các dòng bị thiếu thông tin quan trọng
            cols_to_check = ['track_id', 'track_name', 'artists', 'track_genre', 'valence', 'energy', 'tempo']
            df = df.dropna(subset=cols_to_check)
            
            # 3. LỌC NÂNG CAO: NHẠC ĐỊA PHƯƠNG 
            regional_genres = [
                'bollywood', 'indian', 'latin', 'latino', 'spanish', 'salsa', 'tango', 'samba', 
                'mandopop', 'cantopop', 'malay', 'turkish', 'iranian', 
                'french', 'german', 'swedish', 'brazil', 'reggaeton', 'afrobeat', 'forro', 'pagode', 'sertanejo'
            ]
            
            bad_tracks = df[df['track_genre'].isin(regional_genres)][['track_name', 'artists']].drop_duplicates()
            bad_tracks['is_bad'] = True # Đánh dấu cờ
            
            df = df.merge(bad_tracks, on=['track_name', 'artists'], how='left')
            
            df = df[df['is_bad'].isnull()]
            df = df.drop(columns=['is_bad'])
            
            df = df.drop_duplicates(subset=['track_id'])
            
            self.stdout.write(self.style.WARNING(f"Số lượng sau khi LỌC SẠCH: {len(df)} bài hát. Bắt đầu bơm vào DB..."))

            tracks_to_create = []
            for index, row in df.iterrows():
                track = SpotifyTrack(
                    track_id=str(row['track_id']),
                    track_name=str(row['track_name'])[:255],
                    artists=str(row['artists'])[:255],
                    album_name=str(row.get('album_name', ''))[:255],
                    genre=str(row['track_genre'])[:100],
                    popularity=int(row['popularity']),
                    valence=float(row['valence']),
                    energy=float(row['energy']),
                    tempo=float(row['tempo']),
                    acousticness=float(row['acousticness']),
                    instrumentalness=float(row['instrumentalness'])
                )
                tracks_to_create.append(track)
                
                if len(tracks_to_create) == 5000:
                    SpotifyTrack.objects.bulk_create(tracks_to_create, ignore_conflicts=True)
                    self.stdout.write(f"Đã nạp {index + 1} bài...")
                    tracks_to_create = []

            if tracks_to_create:
                SpotifyTrack.objects.bulk_create(tracks_to_create, ignore_conflicts=True)

            self.stdout.write(self.style.SUCCESS('Nhập dữ liệu THÀNH CÔNG!'))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f'LỖI: {str(e)}'))