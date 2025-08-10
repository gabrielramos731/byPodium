from .models import evento, categoria, kit
from inscricoes.models import inscricao
from django.db.models import Count, Sum, Avg
from datetime import datetime

class EventReports:
    @staticmethod
    def get_event_summary(event_id):
        try:
            event = evento.objects.get(id=event_id)
            inscricoes = inscricao.objects.filter(evento=event)
            
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
                'data_geracao': datetime.now().strftime("%d/%m/%Y %H:%M")
            }
        except evento.DoesNotExist:
            return None

    @staticmethod
    def get_events_by_period(data_inicio, data_fim, organizador=None):
        if not data_inicio or not data_fim:
            return None
            
        eventos_query = evento.objects.filter(
            dataIni__gte=data_inicio,
            dataIni__lte=data_fim
        ).select_related('localidade')
        
        if organizador:
            eventos_query = eventos_query.filter(organizador=organizador)
        
        eventos = eventos_query
        
        inscricoes_count = {
            e.id: inscricao.objects.filter(evento=e).count() 
            for e in eventos
        }
        
        return {
            'periodo': {
                'inicio': data_inicio.strftime("%d/%m/%Y"),
                'fim': data_fim.strftime("%d/%m/%Y"),
            },
            'eventos': [{
                'nome': event.nome,
                'data': event.dataIni.strftime("%d/%m/%Y"),
                'total_inscritos': inscricoes_count[event.id],
                'status': 'Finalizado' if event.dataIni < datetime.now().date() else 'Em andamento',
                'local': f"{event.localidade.cidade}/{event.localidade.uf}" if hasattr(event, 'localidade') else "N/A"
            } for event in eventos],
            'total_eventos': eventos.count(),
            'data_geracao': datetime.now().strftime("%d/%m/%Y %H:%M")
        }

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