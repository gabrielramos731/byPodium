import json
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
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from datetime import datetime

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
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        current_participante = get_current_participante(self.request)
        return inscricao.objects.filter(participante=current_participante)


class CriarInscricao(generics.GenericAPIView):
    """GET: Categorias e kits do evento. POST: Cria inscrição"""
    serializer_class = InscricaoCreateSerializer
    queryset = inscricao.objects.all()
    permission_classes = [permissions.IsAuthenticated]  
    
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
    permission_classes = [permissions.IsAuthenticated]
    

class DetalhesParticipante(generics.ListAPIView):
    """Detalhes completos do participante"""
    serializer_class = DetalhesParticipanteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        current_participante = get_current_participante(self.request)
        return participante.objects.filter(pk=current_participante.pk)


class CancelarInscricao(generics.DestroyAPIView):
    """Cancela uma inscrição específica"""
    queryset = inscricao.objects.all()
    serializer_class = InscricaoResponseSerializer
    permission_classes = [permissions.IsAuthenticated] 

class CriarEvento(generics.CreateAPIView):
    """Cria evento"""
    serializer_class = eventoSerializer
    queryset = evento.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer(self, *args, **kwargs):
        
        if hasattr(self.request, 'data'):
            data = self.request.data.copy()
            
            if 'categorias' in data and isinstance(data['categorias'], str):
                try:
                    data['categorias'] = json.loads(data['categorias'])
                except (json.JSONDecodeError, TypeError):
                    pass
            
            if 'kits' in data and isinstance(data['kits'], str):
                try:
                    data['kits'] = json.loads(data['kits'])
                except (json.JSONDecodeError, TypeError):
                    pass
            
            kwargs['data'] = data
        
        return super().get_serializer(*args, **kwargs)
    
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
        from datetime import date
        
        evento_obj = evento.objects.get(pk=pk)
        current_participante = get_current_participante(request)

        if evento_obj.organizador.participante != current_participante:
            return Response(
                {'error': 'Você não tem permissão para editar este evento.'},
                status=status.HTTP_403_FORBIDDEN
                )
        
        if evento_obj.dataFim < date.today():
            return Response(
                {'error': 'Não é possível editar um evento que já foi encerrado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = self.get_serializer(evento_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    def delete(self, request, pk):
        """Cancela/deleta um evento"""
        from datetime import date
        
        evento_obj = evento.objects.get(pk=pk)
        current_participante = get_current_participante(request)

        if evento_obj.organizador.participante != current_participante:
                return Response(
                    {'error': 'Você não tem permissão para cancelar este evento.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        if evento_obj.dataFim < date.today():
            return Response(
                {'error': 'Não é possível cancelar um evento que já foi encerrado.'},
                status=status.HTTP_400_BAD_REQUEST
            )
         
        evento_obj.delete()
        return Response({'message': 'Evento cancelado com sucesso.'}, status=status.HTTP_200_OK)

class GerarRelatorio(generics.GenericAPIView):
    """
    Classe para geração de relatórios do sistema
    GET /eventos/<event_id>/report/: Gera relatório de um evento específico
    GET /eventos/period-report/: Gera relatório por período
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_event_report(self, request, event_id):
        """Gera relatório detalhado de um evento específico"""
        try:
            event = evento.objects.get(id=event_id)
            current_participante = get_current_participante(request)

            if event.organizador.participante != current_participante:
                return Response(
                    {'error': 'Você não tem permissão para gerar relatórios deste evento.'},
                    status=status.HTTP_403_FORBIDDEN
                )
                
            from .reports import EventReports
            report_type = request.query_params.get('type', 'summary')
            
            if report_type == 'summary':
                report = EventReports.get_event_summary(event_id)
            elif report_type == 'participants':
                report = EventReports.get_participant_report(event_id)
            else:
                return Response({'error': 'Tipo de relatório inválido'}, status=400)
            
            if report is None:
                return Response({'error': 'Evento não encontrado'}, status=404)
            
            return Response(report)
            
        except evento.DoesNotExist:
            return Response({'error': 'Evento não encontrado'}, status=404)
    
    def get_period_report(self, request):
        """
        Gera relatório de eventos em um período específico
        Parâmetros obrigatórios:
        - data_inicio: YYYY-MM-DD
        - data_fim: YYYY-MM-DD
        """
        from .reports import EventReports
        try:
            data_inicio = datetime.strptime(request.query_params.get('data_inicio'), '%Y-%m-%d').date()
            data_fim = datetime.strptime(request.query_params.get('data_fim'), '%Y-%m-%d').date()
        except (ValueError, TypeError):
            return Response({
                'error': 'Formato de data inválido. Use YYYY-MM-DD',
                'exemplo': {
                    'data_inicio': '2024-01-01',
                    'data_fim': '2024-12-31'
                }
            }, status=400)
        
        if data_inicio > data_fim:
            return Response({
                'error': 'Data inicial não pode ser maior que a data final'
            }, status=400)
        
        report = EventReports.get_events_by_period(data_inicio, data_fim)
        return Response(report)

    def get(self, request, event_id=None):
        """
        Roteador para os diferentes tipos de relatório
        Se event_id for fornecido, gera relatório do evento
        Caso contrário, gera relatório por período
        """
        if event_id is not None:
            return self.get_event_report(request, event_id)
        return self.get_period_report(request)