from django.db import models

class MC:
    evento_status = (
        ('pendente', 'Pendente'),
        ('ativo', 'Ativo'),
        ('negado', 'Negado'),
        ('cancelado', 'Cancelado')
    )

class localidade(models.Model):
    cidade = models.CharField(max_length=100, blank=False, null=False)
    uf = models.CharField(max_length=2, blank=False, null=False)

class participante(models.Model):
    nome = models.CharField(max_length=100, blank=False, null=False)
    cpf = models.CharField(max_length=11, unique=True, blank=False, null=False)
    email = models.EmailField(blank=False, null=False)
    data_nascimento = models.DateField(blank=False, null=False)
    telefone = models.CharField(max_length=15, blank=False, null=False)
    rua = models.CharField(max_length=100, blank=False, null=True)
    numero = models.CharField(max_length=10, blank=False, null=True)
    bairro = models.CharField(max_length=100, blank=False, null=True)
    localidade = models.ForeignKey(localidade, on_delete=models.CASCADE, related_name='participantes', default=1)
    
class organizador(models.Model):
    valor = models.DecimalField(max_digits=10, decimal_places=2, blank=False, null=False, default=0)
    participante = models.ForeignKey(participante, on_delete=models.CASCADE, related_name='organizadores')

class evento(models.Model):
    nome = models.CharField(max_length=100, blank=True, null=True)
    descricao = models.CharField(max_length=50000, null=False, blank=False)
    dataIni = models.DateField(blank=False, null=False)
    dataFim = models.DateField(blank=False, null=False)
    dataIniInsc = models.DateField(blank=False, null=False)
    dataFimInsc = models.DateField(blank=False, null=False)
    limiteQuantInsc = models.PositiveIntegerField(blank=False, null=False)
    quantInscAtual = models.PositiveIntegerField(blank=False, null=False, default=0)
    valorInsc = models.DecimalField(max_digits=6, decimal_places=2, blank=False, null=False)
    status = models.CharField(choices=MC().evento_status, max_length=10, default='pendente')
    organizador = models.ForeignKey(organizador, on_delete=models.CASCADE, related_name='eventos')
    localidade = models.ForeignKey(localidade, on_delete=models.CASCADE, related_name='eventos', default=1)
    # imagens
