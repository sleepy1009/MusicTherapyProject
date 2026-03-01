from django.db import models
from django.contrib.auth.models import AbstractUser

# 1. Model User 
class User(AbstractUser):
    # username, password, email, first_name... already exis
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    avatar = models.URLField(max_length=500, blank=True, null=True)
    
    # JSONField to save hobby type ['pop', 'piano']
    music_preferences = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username

# 2. Model test DASS-21
class DassResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dass_results')
    
    # 0 - 42
    stress_score = models.IntegerField()
    anxiety_score = models.IntegerField()
    depression_score = models.IntegerField()
    
    # Results: Normal, Mild, Moderate, Severe, Extremely Severe (ex: "Severe Stress") 
    stress_level = models.CharField(max_length=20)
    anxiety_level = models.CharField(max_length=20)
    depression_level = models.CharField(max_length=20)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.created_at.date()}"

# 3. TRACK info 
class Track(models.Model):
    spotify_id = models.CharField(max_length=50, primary_key=True)
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    album_cover = models.URLField(max_length=500, null=True, blank=True)
    
    # Cache YouTube ID 
    youtube_id = models.CharField(max_length=50, null=True, blank=True)
    
    # ISO Principle
    valence = models.FloatField(help_text="Độ tích cực (0.0 - 1.0)")
    energy = models.FloatField(help_text="Năng lượng (0.0 - 1.0)")
    tempo = models.FloatField(help_text="Nhịp độ (BPM)")
    
    def __str__(self):
        return f"{self.title} - {self.artist}"

# 4. PLAYLIST
class ListeningSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    dass_result = models.ForeignKey(DassResult, on_delete=models.CASCADE)
    
    tracks = models.ManyToManyField(Track, related_name='sessions')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Session {self.id} for {self.user.username}"

# 5. FEEDBACK
class MusicFeedback(models.Model):
    class Action(models.TextChoices):
        LISTENED = 'LISTENED', 'Đã nghe hết'
        SKIPPED = 'SKIPPED', 'Bỏ qua'
        LIKED = 'LIKED', 'Yêu thích'
        DISLIKED = 'DISLIKED', 'Không thích'

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    
    action = models.CharField(max_length=20, choices=Action.choices)
    rating = models.IntegerField(null=True, blank=True) # 1-5 sao
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Một user chỉ feedback 1 kiểu cho 1 bài hát tại 1 thời điểm (tránh spam)
        indexes = [
            models.Index(fields=['user', 'track']),
        ]

# 6. CHAT/NHẬT KÝ
class UserLog(models.Model):
    class LogType(models.TextChoices):
        CHAT = 'CHAT', 'Trò chuyện Chatbot'
        DIARY = 'DIARY', 'Nhật ký cảm xúc'
        LOGIN = 'LOGIN', 'Đăng nhập'

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    log_type = models.CharField(max_length=20, choices=LogType.choices)
    
    content = models.TextField(blank=True, null=True) # Nội dung chat/nhật ký
    sentiment_score = models.FloatField(null=True, blank=True) # Điểm cảm xúc nếu có phân tích NLP
    
    created_at = models.DateTimeField(auto_now_add=True)