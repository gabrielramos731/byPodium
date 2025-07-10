from django.urls import path
from .views import ListEventos, DetailEvento

urlpatterns = [
    path('', ListEventos.as_view(), name='homepage'),
    path('<int:pk>/', DetailEvento.as_view(), name='evento-detail'),
]
