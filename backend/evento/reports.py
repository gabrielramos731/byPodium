from .models import evento, categoria, kit
from inscricoes.models import inscricao
from django.db.models import Count, Sum, Avg
from datetime import datetime, timedelta
from collections import defaultdict

class EventReports:
    @staticmethod
    def get_event_summary(event_id):
        try:
            event = evento.objects.get(id=event_id)
            inscricoes = inscricao.objects.filter(evento=event)
            
            # Calcular inscrições por dia
            inscricoes_por_dia = defaultdict(int)
            
            # Obter todas as inscrições com suas datas
            from django.db.models import DateTimeField, DateField
            from django.db.models.functions import Cast, TruncDate
            
            inscricoes_com_data = inscricoes.annotate(
                data_inscricao_date=Cast('dataInsc', DateField())
            ).values('data_inscricao_date').annotate(
                count=Count('id')
            ).order_by('data_inscricao_date')
            
            # Criar lista de datas desde a primeira inscrição até hoje
            if inscricoes_com_data:
                primeira_data = inscricoes_com_data[0]['data_inscricao_date']
                ultima_data = datetime.now().date()
                
                # Inicializar todas as datas com 0
                data_atual = primeira_data
                while data_atual <= ultima_data:
                    inscricoes_por_dia[data_atual.strftime('%Y-%m-%d')] = 0
                    data_atual += timedelta(days=1)
                
                # Preencher com os dados reais
                for item in inscricoes_com_data:
                    if item['data_inscricao_date']:
                        data_str = item['data_inscricao_date'].strftime('%Y-%m-%d')
                        inscricoes_por_dia[data_str] = item['count']
            
            # Converter para listas ordenadas para o gráfico
            datas_ordenadas = sorted(inscricoes_por_dia.keys())
            inscricoes_ordenadas = [inscricoes_por_dia[data] for data in datas_ordenadas]
            
            return {
                'evento': {
                    'nome': event.nome,
                    'data': event.dataIni,
                    'local': f"{event.localidade.cidade}/{event.localidade.uf}",
                    'capacidade': event.limiteQuantInsc,
                },
                'estatisticas': {
                    'total_inscritos': inscricoes.count(),
                    'vagas_disponiveis': event.limiteQuantInsc - inscricoes.count(),
                    'taxa_ocupacao': (inscricoes.count() / event.limiteQuantInsc * 100) if event.limiteQuantInsc > 0 else 0,
                },
                'status_inscricoes': {
                    'confirmadas': inscricoes.filter(status='confirmada').count(),
                    'pendentes': inscricoes.filter(status='pendente').count(),
                    'canceladas': inscricoes.filter(status='cancelado').count(),
                },
                'kits': {
                    kit.nome: inscricoes.filter(kit=kit).count() 
                    for kit in event.kits.all()
                },
                'categorias': {
                    cat.nome: inscricoes.filter(categoria=cat).count()
                    for cat in event.categorias.all()
                },
                'inscricoes_por_dia': {
                    'datas': datas_ordenadas,
                    'inscricoes_diarias': inscricoes_ordenadas
                },
                'data_geracao': datetime.now().strftime("%d/%m/%Y %H:%M")
            }
        except evento.DoesNotExist:
            return None

    @staticmethod
    def get_participant_report(event_id):
        try:
            event = evento.objects.get(id=event_id)
            inscricoes = inscricao.objects.filter(evento=event).select_related('participante')
            
            return {
                'evento': event.nome,
                'participantes': [{
                    'nome': insc.participante.nome,
                    'email': insc.participante.email,
                    'kit': insc.kit.nome if insc.kit else 'Sem kit',
                    'status': insc.status,
                    'data_inscricao': insc.dataInsc.strftime("%d/%m/%Y")
                } for insc in inscricoes],
                'total_participantes': inscricoes.count(),
                'data_geracao': datetime.now().strftime("%d/%m/%Y %H:%M")
            }
        except evento.DoesNotExist:
            return None