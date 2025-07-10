from rest_framework import generics
from .models import evento, localidade, participante, organizador, inscricao
from .serializers import eventoSerializer, inscricaoSerializer

class ListEventos(generics.ListAPIView):
    queryset = evento.objects.all()
    serializer_class = eventoSerializer

class DetailEvento(generics.RetrieveAPIView):
    queryset = evento.objects.all()
    serializer_class = eventoSerializer

class ListInscricoes(generics.ListAPIView):
    queryset = inscricao.objects.all()
    serializer_class = inscricaoSerializer