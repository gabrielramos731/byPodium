from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Endpoints de autenticação principais
    path('register/', views.RegisterView.as_view(), name='auth-register'),
    path('login/', views.LoginView.as_view(), name='auth-login'),
    path('logout/', views.LogoutView.as_view(), name='auth-logout'),
    path('profile/', views.ProfileView.as_view(), name='auth-profile'),
    
    # Token refresh
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Endpoints de validação
    path('check-email/', views.check_email, name='check-email'),
    path('check-cpf/', views.check_cpf, name='check-cpf'),
]
