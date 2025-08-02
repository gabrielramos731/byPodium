from rest_framework import serializers
from .models import participante, organizador
from localidades.models import localidade


class participanteSerializer(serializers.ModelSerializer):
    localidade = serializers.SerializerMethodField()
    
    class Meta:
        model = participante
        fields = '__all__'
        
    def get_localidade(self, obj):
        if obj.localidade:
            return {
                'id': obj.localidade.id,
                'cidade': obj.localidade.cidade,
                'uf': obj.localidade.uf
            }
        return None


class organizadorSerializer(serializers.ModelSerializer):
    participante = participanteSerializer(read_only=True)
    
    class Meta:
        model = organizador
        fields = '__all__'
