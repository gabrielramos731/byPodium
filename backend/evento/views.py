from urllib import request
from rest_framework import generics
from .models import evento, inscricao
from .serializers import eventoSerializer, inscricaoSerializer, eventoSerializerList

class ListEventos(generics.ListAPIView):
    """
    Lista todos os eventos disponíveis no sistema.
    
    Retorna uma lista simplificada dos eventos com informações básicas
    como nome, data de início, localidade e horário.
    """
    queryset = evento.objects.all()
    serializer_class = eventoSerializerList

class DetailEvento(generics.RetrieveAPIView):
    """
    Retorna os detalhes completos de um evento específico.
    
    Inclui todas as informações do evento, dados da localidade
    e email do organizador responsável.
    """
    queryset = evento.objects.all()
    serializer_class = eventoSerializer

class ListInscricoes(generics.ListAPIView):
    """
    Lista todas as inscrições realizadas no sistema.
    
    Retorna informações completas das inscrições incluindo
    participante, evento, categoria e kit selecionados.
    """
    queryset = inscricao.objects.all()
    serializer_class = inscricaoSerializer
    