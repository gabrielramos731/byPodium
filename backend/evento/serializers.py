from rest_framework import serializers
from .models import evento, localidade, participante, organizador

class eventoSerializer(serializers.ModelSerializer):
    class Meta():
        model = evento
        fields = '__all__'

class localidadeSerializer(serializers.ModelSerializer):
    class Meta():
        model = localidade
        fields = '__all__'
        
class participanteSerializer(serializers.ModelSerializer):
    class Meta():
        model = participante
        fields = '__all__'
        
class organizadorSerializer(serializers.ModelSerializer):
    class Meta():
        model = organizador
        fields = '__all__'