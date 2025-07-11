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
        fields = ('nome', 'descricao', 'horarioIni', 'dataIni', 'dataFim', 'dataIniInsc', 'dataFimInsc', 'valorInsc', 'localidade','organizador_email','imagem')

    def get_organizador_email(self, obj):
        return obj.organizador.participante.email

class eventoSerializerList(serializers.ModelSerializer):
    localidade = localidadeSerializer(read_only=True)
    photo_url = serializers.SerializerMethodField()
    class Meta():
        model = evento
        fields = ('nome', 'dataIni', 'localidade', 'horarioIni', 'photo_url') 

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.imagem and hasattr(obj.imagem, 'url'):
            url = obj.imagem.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None
    
class inscricaoSerializer(serializers.ModelSerializer):
    class Meta():
        model = inscricao
        fields = '__all__'
    