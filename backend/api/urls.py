from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserProfileView, DiaryEntryListCreateView, 
    DiaryEntryDetailView, DassResultListCreateView, 
    GenerateTherapyPlaylistView, ListeningSessionView, FetchYouTubeLinksView, SwapOptionsView,
    SwapConfirmView, UserStatsView, ToggleLikeView, LikedTracksView, BuildLikedTherapyView # Import thêm view
)
# sry for code-switch OwO
urlpatterns = [
    # API login - default lib SimpleJWT
    path('users/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('users/register/', RegisterView.as_view(), name='register'),
    
    # Profile: Me - Onboarding)
    path('users/me/', UserProfileView.as_view(), name='user_profile'),

    path('users/diary/', DiaryEntryListCreateView.as_view(), name='diary-list-create'),
    path('users/diary/<int:pk>/', DiaryEntryDetailView.as_view(), name='diary-detail'),

    path('users/dass21/', DassResultListCreateView.as_view(), name='dass21-list-create'),

    path('users/therapy-playlist/', GenerateTherapyPlaylistView.as_view(), name='therapy-playlist'),

    path('users/sessions/', ListeningSessionView.as_view(), name='sessions'),

    path('users/youtube-links/', FetchYouTubeLinksView.as_view(), name='youtube-links'),

    path('users/swap-options/', SwapOptionsView.as_view(), name='swap-options'),
    path('users/swap-confirm/', SwapConfirmView.as_view(), name='swap-confirm'),

    path('users/stats/', UserStatsView.as_view(), name='user-stats'),

    path('users/like-track/', ToggleLikeView.as_view(), name='toggle-like'),
    path('users/liked-tracks/', LikedTracksView.as_view(), name='liked-tracks'),

    path('users/build-liked-therapy/', BuildLikedTherapyView.as_view(), name='build-liked-therapy'),
]