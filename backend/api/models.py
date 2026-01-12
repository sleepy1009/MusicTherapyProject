from django.db import models
from django.contrib.auth.models import AbstractUser

# 1. Model User 
class User(AbstractUser):
    # username, password, email, first_name... already exis
    avatar = models.URLField(max_length=500, blank=True, null=True)
    google_id = models.CharField(max_length=255, blank=True, null=True)
    
    # JSONField to save hobby type ['pop', 'piano']
    preferences = models.JSONField(default=dict, blank=True) 
    
    def __str__(self):
        return self.username

# 2. Model test DASS-21
class DassResult(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dass_results')
    
    score_stress = models.IntegerField()
    score_anxiety = models.IntegerField()
    score_depression = models.IntegerField()
    
    # Results (ex: "Severe Stress")
    level_stress = models.CharField(max_length=50)
    level_anxiety = models.CharField(max_length=50)
    level_depression = models.CharField(max_length=50)
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.created_at.strftime('%Y-%m-%d')}"

# 3. Model Feedback (learning follow behaviour)
class MusicFeedback(models.Model):
    class ActionType(models.TextChoices):
        LISTENED = 'LISTENED', 'Đã nghe hết'
        SKIPPED = 'SKIPPED', 'Bỏ qua'
        LIKED = 'LIKED', 'Yêu thích'
        DISLIKED = 'DISLIKED', 'Không thích'

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    track_id = models.CharField(max_length=100) # ID of Spotify songs
    track_name = models.CharField(max_length=255)
    artist_name = models.CharField(max_length=255)
    
    # action user
    action = models.CharField(max_length=20, choices=ActionType.choices)
    rating = models.IntegerField(null=True, blank=True) # 1-5 star
    
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.track_name} - {self.action}"