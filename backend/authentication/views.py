from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from usuarios.models import participante

from .serializers import (
    CompleteRegistrationSerializer,
    LoginSerializer,
    UserProfileSerializer
)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = CompleteRegistrationSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                result = serializer.save()
                user = result['user']
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    'message': 'Usuário cadastrado com sucesso',
                    'user': {
                        'id': user.id,
                        'email': user.email,
                        'nome': user.first_name
                    },
                    'tokens': {
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                    }
                }, status=status.HTTP_201_CREATED)
                
            except Exception as e:
                return Response({
                    'error': f'Erro interno do servidor: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'error': 'Campos obrigatórios não preenchidos',
            'details': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            
            try:
                participante_obj = participante.objects.get(user=user)
                participante_data = {
                    'id': participante_obj.id,
                    'nome': participante_obj.nome,
                    'cpf': participante_obj.cpf,
                    'telefone': participante_obj.telefone
                }
            except participante.DoesNotExist:
                participante_data = None
            
            return Response({
                'message': 'Login realizado com sucesso',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'nome': user.first_name,
                    'participante': participante_data
                },
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'error': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({
                    'message': 'Logout realizado com sucesso'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Token de refresh não fornecido'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': f'Erro ao fazer logout: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_email(request):
    email = request.GET.get('email')
    if not email:
        return Response({
            'error': 'Email não fornecido'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    exists = User.objects.filter(email=email).exists()
    return Response({
        'exists': exists
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def check_cpf(request):
    cpf = request.GET.get('cpf')
    if not cpf:
        return Response({
            'error': 'CPF não fornecido'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    exists = participante.objects.filter(cpf=cpf).exists()
    return Response({
        'exists': exists
    })
