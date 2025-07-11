from rest_framework import serializers
from .models import evento, localidade, participante, organizador, inscricao

class participanteSerializer(serializers.ModelSerializer):
    class Meta():
        model = participante
        fields = '__all__'

class organizadorSerializer(serializers.ModelSerializer):
    class Meta():
        model = organizador
        fields = '__all__'

class localidadeSerializer(serializers.ModelSerializer):
    class Meta():
        model = localidade
        fields = '__all__'

class eventoSerializer(serializers.ModelSerializer):
    localidade = localidadeSerializer(read_only=True)
    organizador_email = serializers.SerializerMethodField()
    class Meta():
        model = evento
        fields = ('nome', 'descricao', 'horarioIni', 'dataIni', 'dataFim', 'dataIniInsc', 'dataFimInsc', 'valorInsc', 'localidade','organizador_email')

    def get_organizador_email(self, obj):
        return obj.organizador.participante.email

class eventoSerializerList(serializers.ModelSerializer):
    localidade = localidadeSerializer(read_only=True)
    class Meta():
        model = evento
        fields = ('nome', 'dataIni', 'localidade', 'horarioIni') # +imagem


class inscricaoSerializer(serializers.ModelSerializer):
    class Meta():
        model = inscricao
        fields = '__all__'
    