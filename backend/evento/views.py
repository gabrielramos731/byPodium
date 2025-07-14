from urllib import request
from rest_framework import generics, status
from rest_framework.response import Response
from .models import evento, inscricao, categoria, kit, participante
from .serializers import (
    eventoSerializer, inscricaoSerializer, eventoSerializerList,
    InscricaoCreateSerializer, InscricaoResponseSerializer, 
    DetalhesParticipanteSerializer
)
from datetime import date

class ListEventos(generics.ListAPIView):
    """
    Lista todos os eventos disponíveis no sistema.
    
    Retorna uma lista simplificada dos eventos com informações básicas
    como nome, data de início, localidade e horário.
    """
    queryset = evento.objects.all()
    serializer_class = eventoSerializerList


class DetailEvento(generics.RetrieveAPIView):
    """
    Retorna os detalhes completos de um evento específico.
    
    Inclui todas as informações do evento, dados da localidade
    e email do organizador responsável.
    """
    queryset = evento.objects.all()
    serializer_class = eventoSerializer

class ListInscricoes(generics.ListAPIView):
    """
    Lista todas as inscrições realizadas no sistema.
    
    Retorna informações completas das inscrições incluindo
    participante, evento, categoria e kit selecionados.
    """
    def get_queryset(self):
        return inscricao.objects.filter(participante__id=1)  #user teste para inscrição
    
    queryset = inscricao.objects.all()
    serializer_class = inscricaoSerializer

class CriarInscricao(generics.GenericAPIView):
    """
    GET: Retorna categorias e kits disponíveis para o evento.
    POST: Cria uma nova inscrição no evento.
    """
    serializer_class = InscricaoCreateSerializer
    
    def get(self, request, pk):
        """Retorna dados para inscrição: Evento, categorias e kits e usuário"""
        
        user_dummy = {  # usuário teste para inscrição
            'nome': participante.objects.get(pk=1).nome,
            'dataNascimento': participante.objects.get(pk=1).data_nascimento,
            'cpf': participante.objects.get(pk=1).cpf,
            'email': participante.objects.get(pk=1).email,
        }
        evento_obj = evento.objects.get(pk=pk)
        nascimento = user_dummy.get('dataNascimento')
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
            'usuario': [
                user_dummy
            ],
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
        
        serializer = self.get_serializer(data=data)
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
        participante_obj = participante.objects.get(pk=1)  # usuário teste para inscrição
        inscricao_obj = inscricao.objects.get(participante=participante_obj, evento__id=pk)
        inscricao_obj.delete()
        evento_obj = inscricao_obj.evento
        evento_obj.quantInscAtual -= 1
        evento_obj.save()
        return Response(
            status=status.HTTP_204_NO_CONTENT
        )
           
class DetalhesInscricao(generics.RetrieveAPIView):
    """
    Retorna detalhes de uma inscrição específica.
    """
    queryset = inscricao.objects.all()
    serializer_class = InscricaoResponseSerializer
    
class DetalhesParticipante(generics.ListAPIView):
    """
    Retorna os detalhes completos de um participante específico.
    
    Inclui informações pessoais, endereço e localidade associada.
    """
    # queryset = participante.objects.all()
    queryset = participante.objects.filter(pk=1)  # PARA DESENVOLVIMENTO
    serializer_class = DetalhesParticipanteSerializer

class CancelarInscricao(generics.DestroyAPIView):
    """
    Cancela uma inscrição específica.
    
    Remove a inscrição do participante e atualiza o número de inscrições
    atuais do evento.
    """
    queryset = inscricao.objects.all()
    serializer_class = InscricaoResponseSerializer
    