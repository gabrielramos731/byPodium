from rest_framework import serializers
from .models import evento, localidade, participante, organizador, inscricao, categoria, kit, item

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
    isInscrito = serializers.SerializerMethodField()

    class Meta():
        model = evento
        fields = ('nome', 'descricao', 'valorInsc', 'horarioIni', 'dataIni', 'dataFim', 'dataIniInsc', 'dataFimInsc', 'valorInsc', 'localidade','organizador_email','imagem', 'isInscrito')

    def get_organizador_email(self, obj):
        return obj.organizador.participante.email
    
    def get_isInscrito(self, obj):
        participante_id = 1  
        return inscricao.objects.filter(evento=obj, participante_id=participante_id).exists()

class eventoSerializerList(serializers.ModelSerializer):
    localidade = localidadeSerializer(read_only=True)
    photo_url = serializers.SerializerMethodField()
    class Meta():
        model = evento
        fields = ('id', 'nome', 'dataIni', 'localidade', 'horarioIni', 'photo_url') 

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

class InscricaoCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = inscricao
        fields = ('categoria', 'kit')
    
    def create(self, validated_data):
        # DESENVOLVIMENTO: Sempre usar participante pk=1
        participante_obj = participante.objects.get(pk=1)
        
        inscricao_obj = inscricao.objects.create(
            participante=participante_obj,
            **validated_data
        )

        evento_obj = validated_data['evento']
        evento_obj.quantInscAtual += 1
        evento_obj.save()
        
        return inscricao_obj

class InscricaoResponseSerializer(serializers.ModelSerializer):
    participante_nome = serializers.CharField(source='participante.nome', read_only=True)
    evento_nome = serializers.CharField(source='evento.nome', read_only=True)
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    kit_nome = serializers.CharField(source='kit.nome', read_only=True)
    
    class Meta:
        model = inscricao
        fields = ('id', 'dataInsc', 'status', 'participante_nome', 'evento_nome', 'categoria_nome', 'kit_nome')

class DetalhesParticipanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = participante
        fields = '__all__'
