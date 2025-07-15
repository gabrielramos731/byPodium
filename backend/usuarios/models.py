from django.db import models

class participante(models.Model):
    nome = models.CharField(max_length=100, blank=False, null=False)
    cpf = models.CharField(max_length=11, unique=True, blank=False, null=False)
    email = models.EmailField(blank=False, null=False)
    data_nascimento = models.DateField(blank=False, null=False)
    telefone = models.CharField(max_length=15, blank=False, null=False)
    rua = models.CharField(max_length=100, blank=False, null=True)
    numero = models.CharField(max_length=10, blank=False, null=True)
    bairro = models.CharField(max_length=100, blank=False, null=True)
    localidade = models.ForeignKey('localidades.localidade', on_delete=models.CASCADE, related_name='participantes', default=1)
    
class organizador(models.Model):
    valor = models.DecimalField(max_digits=10, decimal_places=2, blank=False, null=False, default=0)
    participante = models.OneToOneField(participante, on_delete=models.CASCADE, related_name='organizadores')
