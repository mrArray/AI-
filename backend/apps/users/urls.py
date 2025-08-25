from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Authentication
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Email verification
    path('pre-register-email/', views.PreRegisterEmailVerificationView.as_view(), name='pre-register-email'),
    path('pre-register-verify/', views.PreRegisterCodeVerifyView.as_view(), name='pre-register-verify'),
    
    # Password management
    path('change-password/', views.PasswordChangeView.as_view(), name='change_password'),
    path('reset-password/', views.PasswordResetRequestView.as_view(), name='reset_password'),
    path('reset-password/confirm/', views.PasswordResetConfirmView.as_view(), name='reset_password_confirm'),
    
    # Profile management
    path('profile/', views.UserProfileView.as_view(), name='user_profile'),
    path('stats/', views.UserStatsView.as_view(), name='user_stats'),
    
    # Consolidated preferences endpoint - handles both GET and PATCH
    path('preferences/', views.UserPreferencesView.as_view(), name='user-preferences'),
    
    # Account management
    path('delete-account/', views.DeleteAccountView.as_view(), name='delete_account'),
]