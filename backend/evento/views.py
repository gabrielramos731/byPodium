from rest_framework import generics
from .models import evento, localidade, participante, organizador
from .serializers import eventoSerializer

class ListEventos(generics.ListAPIView):
    queryset = evento.objects.all()
    serializer_class = eventoSerializer

class DetailEvento(generics.RetrieveAPIView):
    queryset = evento.objects.all()
    serializer_class = eventoSerializer

