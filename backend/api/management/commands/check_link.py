import requests
from ytmusicapi import YTMusic
from api.models import Track

ytmusic = YTMusic()
sos_tracks = Track.objects.filter(spotify_id__startswith='sos_')
broken_count = 0

print("Đang tiến hành quét bài hát SOS. Vui lòng đợi...")

for track in sos_tracks:
    if not track.youtube_id:
        continue
        
    url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={track.youtube_id}&format=json"
    res = requests.get(url)
    
    if res.status_code != 200:
        print(f"[PHÁT HIỆN HỎNG]: {track.title} - {track.artist} (ID cũ: {track.youtube_id})")
        broken_count += 1
        
        query = f"{track.title} {track.artist} audio"
        try:
            search_results = ytmusic.search(query, filter="songs", limit=1)
            if search_results:
                new_id = search_results[0]['videoId']
                track.youtube_id = new_id
                track.album_cover = f"https://img.youtube.com/vi/{new_id}/hqdefault.jpg"
                track.save()
                print(f"   Đã vá lỗi thành công! ID mới: {new_id}")
            else:
                print("   Không tìm thấy bài thay thế trên YouTube.")
        except Exception as e:
            print(f"   Lỗi khi tìm kiếm: {e}")

print(f"\n HOÀN TẤT! Đã phát hiện và vá lỗi tự động {broken_count} bài hát bị hỏng link.")