from rest_framework import generics, status, permissions
from rest_framework.response import Response
from .models import evento, categoria, kit
from inscricoes.models import inscricao
from usuarios.models import participante, organizador
from localidades.models import localidade
from .serializers import (
    eventoSerializer, inscricaoSerializer, eventoSerializerList,
    InscricaoCreateSerializer, InscricaoResponseSerializer, 
    DetalhesParticipanteSerializer
)
from datetime import date

def get_current_participante(request):
    """Retorna o participante atual ou fallback para pk=1"""
    if request.user.is_authenticated:
        try:
            return participante.objects.get(user=request.user)
        except participante.DoesNotExist:
            return participante.objects.get(pk=1)
    else:
        return participante.objects.get(pk=1)


class ListEventos(generics.ListAPIView):
    """Lista todos os eventos disponíveis"""
    queryset = evento.objects.all()
    serializer_class = eventoSerializerList
    permission_classes = [permissions.AllowAny]


class DetailEvento(generics.RetrieveAPIView):
    """Detalhes completos de um evento específico"""
    queryset = evento.objects.all()
    serializer_class = eventoSerializer
    permission_classes = [permissions.AllowAny]


class ListInscricoes(generics.ListAPIView):
    """
    Lista todas as inscrições realizadas no sistema.
    
    Retorna informações completas das inscrições incluindo
    participante, evento, categoria e kit selecionados.
    """
    serializer_class = inscricaoSerializer
    permission_classes = [permissions.AllowAny]  
    
    def get_queryset(self):
        current_participante = get_current_participante(self.request)
        return inscricao.objects.filter(participante=current_participante)


class CriarInscricao(generics.GenericAPIView):
    """GET: Categorias e kits do evento. POST: Cria inscrição"""
    serializer_class = InscricaoCreateSerializer
    queryset = inscricao.objects.all()
    permission_classes = [permissions.AllowAny]
    
    def get(self, request, pk):
        """Retorna dados para inscrição: Evento, categorias e kits e usuário"""
        
        current_participante = get_current_participante(request)
        
        user_data = {
            'nome': current_participante.nome,
            'dataNascimento': current_participante.data_nascimento,
            'cpf': current_participante.cpf,
            'email': current_participante.email,
        }
        
        evento_obj = evento.objects.get(pk=pk)
        nascimento = user_data.get('dataNascimento')
        hoje = date.today()
        user_idade = hoje.year - nascimento.year - ((hoje.month, hoje.day) < (nascimento.month, nascimento.day))
        categorias = categoria.objects.filter(evento=evento_obj)
        categorias = [categoria for categoria in categorias if categoria.idadeMin <= user_idade <= categoria.idadeMax]
        kits = kit.objects.filter(evento=evento_obj)
        
        data = {
            'evento': [{
                'id': evento_obj.id,
                'nome': evento_obj.nome,
                }
            ],
            'usuario': [user_data],
            'categorias': [
                {
                    'id': cat.id,
                    'nome': cat.nome,
                    'sexo': cat.sexo,
                }
                for cat in categorias
            ],
            'kits': [
                {
                    'id': kit_obj.id,
                    'nome': kit_obj.nome,
                    'precoExtra': str(kit_obj.precoExtra) if kit_obj.precoExtra else '0.00',
                    'itens': [
                        {
                            'id': item.id,
                            'nome': item.nome,
                            'tamanho': item.tamanho
                        }
                        for item in kit_obj.itens.all()
                    ]
                }
                for kit_obj in kits
            ]
        }
        
        return Response(data)
    
    def post(self, request, pk):
        """Cria inscrição no evento"""
        evento_obj = evento.objects.get(pk=pk)
        data = request.data.copy()
        
        serializer = self.get_serializer(data=data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.validated_data['evento'] = evento_obj

        if evento_obj.quantInscAtual >= evento_obj.limiteQuantInsc:
            return Response(
                {'error': 'Evento lotado. Não há mais vagas disponíveis.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        inscricao_obj = serializer.save()
        response_serializer = InscricaoResponseSerializer(inscricao_obj)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def delete(self, request, pk): 
        current_participante = get_current_participante(request)
        inscricao_obj = inscricao.objects.get(participante=current_participante, evento__id=pk)
        inscricao_obj.delete()
        evento_obj = inscricao_obj.evento
        evento_obj.quantInscAtual -= 1
        evento_obj.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
           

class DetalhesInscricao(generics.RetrieveAPIView):
    """Detalhes de uma inscrição específica"""
    queryset = inscricao.objects.all()
    serializer_class = InscricaoResponseSerializer
    permission_classes = [permissions.AllowAny]
    

class DetalhesParticipante(generics.ListAPIView):
    """Detalhes completos do participante"""
    serializer_class = DetalhesParticipanteSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        current_participante = get_current_participante(self.request)
        return participante.objects.filter(pk=current_participante.pk)


class CancelarInscricao(generics.DestroyAPIView):
    """Cancela uma inscrição específica"""
    queryset = inscricao.objects.all()
    serializer_class = InscricaoResponseSerializer
    permission_classes = [permissions.AllowAny]

class CriarEvento(generics.CreateAPIView):
    """Cria evento"""
    serializer_class = eventoSerializer
    queryset = evento.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        current_participante = get_current_participante(self.request)

        try:
            organizador_obj = current_participante.organizadores
        except organizador.DoesNotExist:
            organizador_obj = organizador.objects.create(
                participante=current_participante,
                valor=0.00
            )
        
        uf = self.request.data.get('uf')
        cidade = self.request.data.get('cidade')
        
        if uf and cidade:
            try:
                localidade_obj = localidade.objects.get(uf=uf.upper(), cidade=cidade)
            except localidade.DoesNotExist:
                localidade_obj = localidade.objects.get(pk=1)
        else:
            localidade_obj = localidade.objects.get(pk=1)
        
        serializer.save(organizador=organizador_obj, localidade=localidade_obj)


class GerenciarEvento(generics.GenericAPIView):
    """GET: Dados para edição. PATCH: Edita evento. DELETE: Cancela evento"""
    serializer_class = eventoSerializer
    queryset = evento.objects.all() 
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        """Retorna dados do evento para edição"""
        evento_obj = evento.objects.get(pk=pk)
        current_participante = get_current_participante(request)
        
        if evento_obj.organizador.participante != current_participante:
            return Response(
                {'error': 'Você não tem permissão para editar este evento.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = self.get_serializer(evento_obj)
        return Response(serializer.data)
        
    def patch(self, request, pk):
        """Edita parcialmente um evento existente"""
        evento_obj = evento.objects.get(pk=pk)
        current_participante = get_current_participante(request)

        if evento_obj.organizador.participante != current_participante:
            return Response(
                {'error': 'Você não tem permissão para editar este evento.'},
                status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = self.get_serializer(evento_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    def delete(self, request, pk):
        """Cancela/deleta um evento"""
        evento_obj = evento.objects.get(pk=pk)
        current_participante = get_current_participante(request)

        if evento_obj.organizador.participante != current_participante:
                return Response(
                    {'error': 'Você não tem permissão para cancelar este evento.'},
                    status=status.HTTP_403_FORBIDDEN
                )
         
        evento_obj.delete()
        return Response({'message': 'Evento cancelado com sucesso.'}, status=status.HTTP_200_OK)


