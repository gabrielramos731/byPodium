from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from inscricoes.models import inscricao, pagamento
from evento.models import evento
import json
from decimal import Decimal
import time
import random


def gateway_payment(request, inscricao_id):
    """
    Página do gateway de pagamento simulado
    """
    try:
        inscricao_obj = get_object_or_404(inscricao, id=inscricao_id)
        
        # Calcula o valor total (valor base do evento + kit extra se houver)
        valor_base = inscricao_obj.evento.valorInsc
        valor_kit = inscricao_obj.kit.precoExtra if inscricao_obj.kit and inscricao_obj.kit.precoExtra else Decimal('0.00')
        valor_total = valor_base + valor_kit
        
        context = {
            'inscricao': inscricao_obj,
            'evento': inscricao_obj.evento,
            'participante': inscricao_obj.participante,
            'kit': inscricao_obj.kit,
            'categoria': inscricao_obj.categoria,
            'valor_total': valor_total,
            'valor_base': valor_base,
            'valor_kit': valor_kit,
        }
        
        return render(request, 'gateway/payment_gateway.html', context)
        
    except inscricao.DoesNotExist:
        return render(request, 'gateway/error.html', {
            'error_message': 'Inscrição não encontrada.'
        })


@csrf_exempt
@require_http_methods(["POST"])
def process_payment(request, inscricao_id):
    """
    Processa o pagamento simulado
    """
    try:
        inscricao_obj = get_object_or_404(inscricao, id=inscricao_id)
        
        # Pega os dados do formulário
        data = json.loads(request.body)
        metodo_pagamento = data.get('metodo_pagamento')
        
        # Simula processamento (pode adicionar delay baseado no método)
        processing_delays = {
            'pix': 1,
            'cartao': 3,
            'boleto': 2
        }
        
        time.sleep(processing_delays.get(metodo_pagamento, 2))
        
        # Simula sucesso/falha (95% de sucesso)
        if random.random() < 0.95:
            # Calcula valor total
            valor_base = inscricao_obj.evento.valorInsc
            valor_kit = inscricao_obj.kit.precoExtra if inscricao_obj.kit and inscricao_obj.kit.precoExtra else Decimal('0.00')
            valor_total = valor_base + valor_kit
            
            # Cria ou atualiza o pagamento
            pagamento_obj, created = pagamento.objects.get_or_create(
                inscricao=inscricao_obj,
                defaults={
                    'status': 'pago',
                    'valor': valor_total,
                    'metodoPagamento': metodo_pagamento
                }
            )
            
            if not created:
                pagamento_obj.status = 'pago'
                pagamento_obj.valor = valor_total
                pagamento_obj.metodoPagamento = metodo_pagamento
                pagamento_obj.save()
            
            # Atualiza status da inscrição
            inscricao_obj.status = 'confirmada'
            inscricao_obj.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Pagamento processado com sucesso!',
                'redirect_url': f'/gateway/success/{inscricao_id}/'
            })
        else:
            # Simula falha no pagamento
            return JsonResponse({
                'success': False,
                'message': 'Falha no processamento do pagamento. Tente novamente.',
                'redirect_url': f'/gateway/error/{inscricao_id}/'
            })
            
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro interno: {str(e)}',
            'redirect_url': f'/gateway/error/{inscricao_id}/'
        })


def payment_success(request, inscricao_id):
    """
    Página de sucesso do pagamento
    """
    try:
        inscricao_obj = get_object_or_404(inscricao, id=inscricao_id)
        pagamento_obj = get_object_or_404(pagamento, inscricao=inscricao_obj)
        
        context = {
            'inscricao': inscricao_obj,
            'pagamento': pagamento_obj,
            'evento': inscricao_obj.evento,
            'participante': inscricao_obj.participante,
        }
        
        return render(request, 'gateway/success.html', context)
        
    except (inscricao.DoesNotExist, pagamento.DoesNotExist):
        return render(request, 'gateway/error.html', {
            'error_message': 'Pagamento não encontrado.'
        })


def payment_error(request, inscricao_id):
    """
    Página de erro do pagamento
    """
    try:
        inscricao_obj = get_object_or_404(inscricao, id=inscricao_id)
        
        context = {
            'inscricao': inscricao_obj,
            'evento': inscricao_obj.evento,
            'error_message': 'Falha no processamento do pagamento. Tente novamente mais tarde.'
        }
        
        return render(request, 'gateway/error.html', context)
        
    except inscricao.DoesNotExist:
        return render(request, 'gateway/error.html', {
            'error_message': 'Inscrição não encontrada.'
        })
