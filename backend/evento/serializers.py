from datetime import date
from rest_framework import serializers
from .models import evento, categoria, kit, item
from localidades.models import localidade
from usuarios.models import participante, organizador
from inscricoes.models import inscricao

def get_current_participante_from_context(context):
    """Obtém o participante atual do contexto ou fallback para pk=1"""
    request = context.get('request')
    if request and request.user.is_authenticated:
        try:
            return participante.objects.get(user=request.user)
        except participante.DoesNotExist:
            return participante.objects.get(pk=1)
    else:
        return participante.objects.get(pk=1)

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
    isInscricaoAberta = serializers.SerializerMethodField()
    inscricaoEvento = serializers.SerializerMethodField()
    isOrganizador = serializers.SerializerMethodField()
    
    class Meta():
        model = evento
        fields = ('nome', 'descricao', 'valorInsc', 'horarioIni', 'dataIni', 'dataFim', 'dataIniInsc', 'dataFimInsc', 'limiteQuantInsc', 'valorInsc', 'localidade','organizador_email','imagem', 'isInscrito', 'isInscricaoAberta','inscricaoEvento', 'isOrganizador')

    def get_organizador_email(self, obj):
        return obj.organizador.participante.email
    
    def get_isInscrito(self, obj):
        current_participante = get_current_participante_from_context(self.context)
        return inscricao.objects.filter(evento=obj, participante=current_participante).exists()
    
    def get_inscricaoEvento(self, obj):
        if obj.dataIniInsc <= date.today() <= obj.dataFimInsc:
            return 'Inscrições Abertas'
        elif date.today() > obj.dataFimInsc:
            return 'Inscrições Encerradas'
        return 'Inscrições Fechadas'

    def get_isInscricaoAberta(self, obj):
        return obj.dataIniInsc <= date.today() <= obj.dataFimInsc

    def get_isOrganizador(self, obj):
        current_participante = get_current_participante_from_context(self.context)
        return obj.organizador.participante == current_participante

class eventoSerializerList(serializers.ModelSerializer):
    localidade = localidadeSerializer(read_only=True)
    photo_url = serializers.SerializerMethodField()
    isInscricaoAberta = serializers.SerializerMethodField()
    isEncerrado = serializers.SerializerMethodField()
    class Meta():
        model = evento
        fields = ('id', 'nome', 'dataIni', 'localidade', 'horarioIni', 'photo_url','isInscricaoAberta', 'isEncerrado') 

    def get_photo_url(self, obj):
        request = self.context.get('request')
        if obj.imagem and hasattr(obj.imagem, 'url'):
            url = obj.imagem.url
            if request is not None:
                return request.build_absolute_uri(url)
            return url
        return None
    
    def get_isInscricaoAberta(self, obj):
        return obj.dataIniInsc <= date.today() <= obj.dataFimInsc
    
    def get_isEncerrado(self, obj):
        return date.today() > obj.dataFim
    
class inscricaoSerializer(serializers.ModelSerializer):
    evento = eventoSerializerList(read_only=True)
    categoria = serializers.SerializerMethodField()
    kit = serializers.SerializerMethodField()
    
    class Meta():
        model = inscricao
        fields = '__all__'
    
    def get_categoria(self, obj):
        if obj.categoria:
            return {
                'id': obj.categoria.id,
                'nome': obj.categoria.nome,
            }
        return None
    
    def get_kit(self, obj):
        if obj.kit:
            return {
                'id': obj.kit.id,
                'nome': obj.kit.nome,
            }
        return None

class InscricaoCreateSerializer(serializers.ModelSerializer):
    kit = serializers.PrimaryKeyRelatedField(queryset=kit.objects.all(), required=False, allow_null=True)
    
    class Meta:
        model = inscricao
        fields = ('categoria', 'kit')
    
    def create(self, validated_data):
        # Usar participante do contexto atual
        current_participante = get_current_participante_from_context(self.context)
        
        inscricao_obj = inscricao.objects.create(
            participante=current_participante,
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
    localidade = localidadeSerializer(read_only=True)
    eventos_organizados = serializers.SerializerMethodField()
    class Meta:
        model = participante
        fields = '__all__'

    def get_eventos_organizados(self, obj):
        current_participante = get_current_participante_from_context(self.context)
        eventos = evento.objects.filter(organizador__participante=current_participante)
        return eventoSerializerList(eventos, many=True, context=self.context).data
