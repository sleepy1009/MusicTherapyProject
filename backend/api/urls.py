from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import RegisterView, UserProfileView, DiaryEntryListCreateView, DiaryEntryDetailView
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
]