from django.db import models

class MC:
    metodo_pagamento = (
        ('pix','Pix'),
        ('boleto','Boleto'),
        ('cartao','Cartão')
    )
    pagamento_status = (
        ('pendente', 'Pendente'),
        ('pago','Pago')
    )
    inscricao_status = (
        ('pendente', 'Pendente'),
        ('confirmada', 'Confirmada'),
        ('cancelado', 'Cancelado')
    )

class inscricao(models.Model):
    dataInsc = models.DateField(auto_now=True)
    status = models.CharField(choices=MC().inscricao_status, default='pendente')
    evento = models.ForeignKey('evento.evento', on_delete=models.CASCADE, related_name='inscricoes')
    participante = models.ForeignKey('usuarios.participante', on_delete=models.CASCADE, related_name='inscricoes', null=True)
    kit = models.ForeignKey('evento.kit', on_delete=models.CASCADE, related_name='inscricoes', null=True)
    categoria = models.ForeignKey('evento.categoria', on_delete=models.CASCADE, related_name='inscricoes', null=True)
    
class pagamento(models.Model):
    status = models.CharField(choices=MC().pagamento_status, max_length=10, default='pendente')
    valor = models.DecimalField(max_digits=10, decimal_places=2, blank=False, null=False, default=0)
    metodoPagamento = models.CharField(choices=MC().metodo_pagamento, max_length=20, null=False, blank=False)
    dataPagamento = models.DateField(auto_now=True)
    inscricao = models.OneToOneField(inscricao, on_delete=models.CASCADE, related_name='pagamentos')
