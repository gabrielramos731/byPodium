from rest_framework import serializers
from django.contrib.auth import authenticate
from usuarios.models import participante
from localidades.models import localidade
from django.contrib.auth.models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ('email', 'password', 'first_name')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True}
        }
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está cadastrado.")
        return value
    
    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name']
        )
        return user


class ParticipanteRegistrationSerializer(serializers.ModelSerializer):
    localidade = serializers.PrimaryKeyRelatedField(queryset=localidade.objects.all())
    
    class Meta:
        model = participante
        fields = (
            'nome', 'cpf', 'data_nascimento', 'telefone', 
            'rua', 'numero', 'bairro', 'localidade'
        )
        
    def validate_cpf(self, value):
        if participante.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está cadastrado.")
        return value


class CompleteRegistrationSerializer(serializers.Serializer):
    # Dados do usuário
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    
    # Dados do participante
    nome = serializers.CharField(max_length=100)
    cpf = serializers.CharField(max_length=14)
    data_nascimento = serializers.DateField()
    telefone = serializers.CharField(max_length=15)
    rua = serializers.CharField(max_length=200)
    numero = serializers.CharField(max_length=10)
    bairro = serializers.CharField(max_length=100)
    localidade = serializers.PrimaryKeyRelatedField(queryset=localidade.objects.all())
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email já está cadastrado.")
        return value
    
    def validate_cpf(self, value):
        if participante.objects.filter(cpf=value).exists():
            raise serializers.ValidationError("Este CPF já está cadastrado.")
        return value
    
    def create(self, validated_data):
        user_data = {
            'email': validated_data['email'],
            'password': validated_data['password'],
            'first_name': validated_data['nome']
        }
        
        participante_data = {
            'nome': validated_data['nome'],
            'cpf': validated_data['cpf'],
            'data_nascimento': validated_data['data_nascimento'],
            'telefone': validated_data['telefone'],
            'rua': validated_data['rua'],
            'numero': validated_data['numero'],
            'bairro': validated_data['bairro'],
            'localidade': validated_data['localidade'],
            'email': validated_data['email']
        }
        
        user = User.objects.create_user(
            username=user_data['email'],
            email=user_data['email'],
            password=user_data['password'],
            first_name=user_data['first_name']
        )
        
        participante_obj = participante.objects.create(
            user=user,
            **participante_data
        )
        
        return {
            'user': user,
            'participante': participante_obj
        }


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = authenticate(username=email, password=password)
            
            if not user:
                raise serializers.ValidationError("E-mail ou senha incorretos")
            
            if not user.is_active:
                raise serializers.ValidationError("Conta desativada")
            
            data['user'] = user
            return data
        else:
            raise serializers.ValidationError("Campos obrigatórios não preenchidos")


class UserProfileSerializer(serializers.ModelSerializer):
    participante = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'date_joined', 'participante')
        read_only_fields = ('id', 'date_joined')
    
    def get_participante(self, obj):
        try:
            participante_obj = participante.objects.get(user=obj)
            from usuarios.serializers import participanteSerializer
            return participanteSerializer(participante_obj).data
        except participante.DoesNotExist:
            return None
