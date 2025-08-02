from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='auth-register'),
    path('login/', views.LoginView.as_view(), name='auth-login'),
    path('logout/', views.LogoutView.as_view(), name='auth-logout'),
    path('profile/', views.ProfileView.as_view(), name='auth-profile'),
    
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    path('check-email/', views.check_email, name='check-email'),
    path('check-cpf/', views.check_cpf, name='check-cpf'),
    
    path('estados/', views.list_estados, name='list-estados'),
    path('cidades/', views.list_cidades, name='list-cidades'),
]
