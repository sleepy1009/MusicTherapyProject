from django.db import models
from django.contrib.auth.models import AbstractUser

# 1. Model User 
class User(AbstractUser):
    # username, password, email, first_name... already exis
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)
    avatar = models.CharField(max_length=500, blank=True, null=True)
    display_name = models.CharField(max_length=255, blank=True, null=True)

    age = models.IntegerField(null=True, blank=True)
    
    # JSONField to save group hobby type ['pop', 'piano']
    music_preferences = models.JSONField(default=dict, blank=True)

    liked_tracks = models.ManyToManyField('Track', related_name='liked_by', blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    is_consented = models.BooleanField(default=False)

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
    
    youtube_id = models.CharField(max_length=50, null=True, blank=True)
    duration = models.CharField(max_length=20, null=True, blank=True)
    
    # ISO Principle
    valence = models.FloatField(default=0.5, help_text="Độ tích cực (0.0 - 1.0)")
    energy = models.FloatField(default=0.5, help_text="Năng lượng (0.0 - 1.0)")
    tempo = models.FloatField(default=100.0, help_text="Nhịp độ (BPM)")
    
    def __str__(self):
        return f"{self.title} - {self.artist}"

# 4. PLAYLIST
class ListeningSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    dass_result = models.ForeignKey(DassResult, on_delete=models.CASCADE, null=True, blank=True)
    
    tracks = models.ManyToManyField(Track, through='SessionTrack', related_name='sessions')

    mood_before = models.IntegerField(null=True, blank=True) # 1-10
    mood_after = models.IntegerField(null=True, blank=True) 
    total_duration_seconds = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Session {self.id} for {self.user.username}"

class SessionTrack(models.Model):
    session = models.ForeignKey(ListeningSession, on_delete=models.CASCADE)
    track = models.ForeignKey(Track, on_delete=models.CASCADE)
    
    order_index = models.IntegerField() 
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order_index'] 
        unique_together = ('session', 'track')

    def __str__(self):
        return f"[{self.order_index}] {self.track.title}"

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
        # only one action got, ignore spam
        indexes = [
            models.Index(fields=['user', 'track']),
        ]

# 6. CHAT/DIARY
class UserLog(models.Model):
    class LogType(models.TextChoices):
        CHAT = 'CHAT', 'Trò chuyện Chatbot'
        DIARY = 'DIARY', 'Nhật ký cảm xúc'
        LOGIN = 'LOGIN', 'Đăng nhập'

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    log_type = models.CharField(max_length=20, choices=LogType.choices)
    
    content = models.TextField(blank=True, null=True) 
    sentiment_score = models.FloatField(null=True, blank=True) 
    
    created_at = models.DateTimeField(auto_now_add=True)


class DiaryEntry(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='diary_entries')
    title = models.CharField(max_length=255)
    content = models.TextField()
    theme = models.CharField(max_length=50, default='theme-default')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.user.username}"

# 7. Spotify Track 
class SpotifyTrack(models.Model):
    track_id = models.CharField(max_length=50, primary_key=True)
    track_name = models.CharField(max_length=255)
    artists = models.CharField(max_length=255)
    album_name = models.CharField(max_length=255, blank=True, null=True)
    genre = models.CharField(max_length=100)
    popularity = models.IntegerField()
    
    valence = models.FloatField()
    energy = models.FloatField()
    tempo = models.FloatField()
    acousticness = models.FloatField()
    instrumentalness = models.FloatField()

    # pre-fetching
    youtube_id = models.CharField(max_length=50, null=True, blank=True)
    image = models.URLField(max_length=500, null=True, blank=True)
    duration = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return f"{self.track_name} - {self.artists}"

# 8. Action chat
class ChatSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions')
    title = models.CharField(max_length=255, default="Cuộc trò chuyện mới")
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"ChatSession {self.id} - {self.user.username}"

class ChatMessage(models.Model):
    class Sender(models.TextChoices):
        USER = 'USER', 'Người dùng'
        BOT = 'BOT', 'Chatbot'

    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=Sender.choices)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp'] # timeline for LLM

    def __str__(self):
        return f"[{self.sender}] {self.content[:50]}"