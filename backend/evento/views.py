import json
from rest_framework import generics, status, permissions, serializers
from rest_framework.response import Response
from .models import evento, categoria, kit
from inscricoes.models import inscricao
from usuarios.models import participante, organizador
from localidades.models import localidade
from .email_service import EmailService
from .serializers import (
    eventoSerializer, inscricaoSerializer, eventoSerializerList,
    InscricaoCreateSerializer, InscricaoResponseSerializer, 
    DetalhesParticipanteSerializer, EventoPendenteSerializer, EventoStatusUpdateSerializer
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
    """Lista eventos ativos (aprovados) disponíveis para visualização"""
    queryset = evento.objects.filter(status='ativo')
    serializer_class = eventoSerializerList
    permission_classes = [permissions.AllowAny]


class ListEventosOrganizador(generics.ListAPIView):
    """Lista eventos do organizador autenticado"""
    serializer_class = eventoSerializerList
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        current_participante = get_current_participante(self.request)
        try:
            organizador_obj = current_participante.organizadores
            return evento.objects.filter(organizador=organizador_obj)
        except organizador.DoesNotExist:
            return evento.objects.none()


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
        
        if evento_obj.dataFim < date.today():
            return Response(
                {'error': 'Não é possível cancelar um evento que já foi encerrado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        evento_obj.status = 'cancelado'
        evento_obj.save()
        
        inscricoes_evento = inscricao.objects.filter(evento=evento_obj)
        inscricoes_evento.update(status='cancelado')
        
        return Response({'message': 'Evento cancelado com sucesso.'}, status=status.HTTP_200_OK)

class GerarRelatorio(generics.GenericAPIView):
    """
    Classe para geração de relatórios do sistema
    GET /eventos/<event_id>/report/: Gera relatório de um evento específico
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, event_id):
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


class GerenciarEventosPendentesAdmin(generics.GenericAPIView):
    """GET: Lista eventos pendentes ou detalhes de um evento específico. PATCH: Atualiza status do evento (apenas admins)"""
    serializer_class = EventoPendenteSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = evento.objects.all()
    
    def get(self, request, pk=None):
        if pk:
            evento_obj = evento.objects.get(pk=pk)
            serializer = self.get_serializer(evento_obj)
            data = serializer.data
            
            data['organizador_email'] = evento_obj.organizador.participante.email
            data['localidade_nome'] = {evento_obj.localidade.cidade}
            data['localidade_uf'] = evento_obj.localidade.uf
            return Response(data)
        else:
            eventos_pendentes = evento.objects.filter(status='pendente')
            serializer = self.get_serializer(eventos_pendentes, many=True)
            data = serializer.data
            
            for i, evento_obj in enumerate(eventos_pendentes):
                data[i]['organizador_email'] = evento_obj.organizador.participante.email
                data[i]['localidade_nome'] = {evento_obj.localidade.cidade}
                data[i]['localidade_uf'] = evento_obj.localidade.uf
            return Response(data)
    
    def patch(self, request, pk):
        try:
            evento_obj = evento.objects.get(pk=pk)

            novo_status = request.data.get('status')
            confirmacao = request.data.get('confirmacao')
            feedback_admin = request.data.get('feedback_admin', '').strip()
            
            if novo_status not in ['ativo', 'negado']:
                return Response(
                    {'error': 'Status deve ser "ativo" ou "negado"'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar se é negação e se feedback é obrigatório
            if novo_status == 'negado' and not feedback_admin:
                return Response(
                    {
                        'error': 'Feedback obrigatório',
                        'message': 'Para negar um evento, é obrigatório fornecer um feedback explicando o motivo da negação.',
                        'requires_feedback': True
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar se a confirmação foi enviada
            if not confirmacao:
                confirmation_message = f'Tem certeza que deseja {"aprovar" if novo_status == "ativo" else "negar"} o evento "{evento_obj.nome}"?'
                if novo_status == 'negado':
                    confirmation_message += f'\n\nFeedback que será enviado: "{feedback_admin}"'
                
                return Response(
                    {
                        'error': 'Confirmação necessária',
                        'message': confirmation_message,
                        'evento': {
                            'id': evento_obj.id,
                            'nome': evento_obj.nome,
                            'organizador': evento_obj.organizador.participante.nome,
                            'status_atual': evento_obj.status,
                            'status_novo': novo_status,
                            'feedback_admin': feedback_admin if novo_status == 'negado' else None
                        },
                        'requires_confirmation': True
                    }, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Verificar se já foi processado
            if evento_obj.status != 'pendente':
                return Response(
                    {'error': f'Este evento já foi {evento_obj.status}. Não é possível alterar novamente.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Atualizar status do evento
            evento_obj.status = novo_status
            evento_obj.save()
            
            # Enviar email baseado na ação
            email_enviado = False
            if novo_status == 'ativo':
                email_enviado = EmailService.enviar_email_aprovacao(evento_obj)
            elif novo_status == 'negado':
                email_enviado = EmailService.enviar_email_negacao(evento_obj, feedback_admin)
            
            serializer = EventoStatusUpdateSerializer(evento_obj)
            response_data = serializer.data
            response_data['message'] = f'Evento {"aprovado" if novo_status == "ativo" else "negado"} com sucesso!'
            response_data['email_enviado'] = email_enviado
            
            if novo_status == 'negado':
                response_data['feedback_enviado'] = feedback_admin
            
            return Response(response_data, status=status.HTTP_200_OK)
            
        except evento.DoesNotExist:
            return Response(
                {'error': 'Evento não encontrado'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
