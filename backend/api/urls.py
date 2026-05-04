from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, UserProfileView, DiaryEntryListCreateView, 
    DiaryEntryDetailView, DassResultListCreateView, 
    GenerateTherapyPlaylistView, ListeningSessionView, FetchYouTubeLinksView, SwapOptionsView,
    SwapConfirmView, UserStatsView, ToggleLikeView, LikedTracksView, BuildLikedTherapyView,
    MusicFeedbackView, ChatInteractView, ChatSessionListView, ChatSessionDetailView, ManualChatSummaryView,
    UpdateSessionMoodView, GoogleLoginView
)
# sry for code-switch OwO
urlpatterns = [
    # API login - default lib SimpleJWT
    path('users/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('users/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('users/register/', RegisterView.as_view(), name='register'),
    path('users/google-login/', GoogleLoginView.as_view(), name='google-login'),
    
    # Profile: Me - Onboarding)
    path('users/me/', UserProfileView.as_view(), name='user_profile'),

    # dass 21 + diary
    path('users/diary/', DiaryEntryListCreateView.as_view(), name='diary-list-create'),
    path('users/diary/<int:pk>/', DiaryEntryDetailView.as_view(), name='diary-detail'),
    path('users/dass21/', DassResultListCreateView.as_view(), name='dass21-list-create'),


    # music 
    path('users/therapy-playlist/', GenerateTherapyPlaylistView.as_view(), name='therapy-playlist'),
    path('users/sessions/', ListeningSessionView.as_view(), name='sessions'),
    path('users/youtube-links/', FetchYouTubeLinksView.as_view(), name='youtube-links'),

    # options
    path('users/swap-options/', SwapOptionsView.as_view(), name='swap-options'),
    path('users/swap-confirm/', SwapConfirmView.as_view(), name='swap-confirm'),

    # session listen
    path('users/stats/', UserStatsView.as_view(), name='user-stats'),
    path('users/like-track/', ToggleLikeView.as_view(), name='toggle-like'),
    path('users/liked-tracks/', LikedTracksView.as_view(), name='liked-tracks'),
    path('users/build-liked-therapy/', BuildLikedTherapyView.as_view(), name='build-liked-therapy'),
    path('users/music-feedback/', MusicFeedbackView.as_view(), name='music-feedback'),

    # session chat
    path('users/chat/', ChatInteractView.as_view(), name='chat-interact'),
    path('users/chat/sessions/', ChatSessionListView.as_view()),
    path('users/chat/sessions/<int:session_id>/', ChatSessionDetailView.as_view()),
    path('users/chat/summarize/', ManualChatSummaryView.as_view(), name='manual-summarize'),
    path('users/session-mood/<int:session_id>/', UpdateSessionMoodView.as_view(), name='session-mood'),
]