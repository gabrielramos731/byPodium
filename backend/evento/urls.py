from django.urls import path
from .views import ListEventos, DetailEvento, ListInscricoes
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', ListEventos.as_view(), name='homepage'),
    path('<int:pk>/', DetailEvento.as_view(), name='evento-detail'),
    # path('inscricoes/', ListInscricoes.as_view(), name='inscricoes')
]

