from django.urls import path
from .views import ListEventos, DetailEvento, ListInscricoes, CriarInscricao, DetalhesInscricao, DetalhesParticipante, CriarEvento, GerenciarEvento, GerarRelatorio

urlpatterns = [
    path('eventos/', ListEventos.as_view(), name='list-eventos'),
    path('eventos/<int:pk>/', DetailEvento.as_view(), name='detail-evento'),

    path('inscricoes/', ListInscricoes.as_view(), name='list-inscricoes'),
    path('inscricoes/<int:pk>/', DetalhesInscricao.as_view(), name='detalhe-inscricao'),
    path('eventos/<int:pk>/criar', CriarInscricao.as_view(), name='criar-inscricao'),

    path('eventos/criar/', CriarEvento.as_view(), name='criar-evento'),
    path('eventos/gerenciar/<int:pk>/', GerenciarEvento.as_view(), name='gerenciar-evento'),
    
    path('perfil/', DetalhesParticipante.as_view(), name='detalhe-participante'),

    path('eventos/<int:event_id>/report/', GerarRelatorio.as_view(), name='event-report'),
    path('eventos/period-report/', GerarRelatorio.as_view(), name='period-report'),
]

