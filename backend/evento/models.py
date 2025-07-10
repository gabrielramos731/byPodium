from django.db import models

class MC:
    evento_status = (
        ('pendente', 'Pendente'),
        ('ativo', 'Ativo'),
        ('negado', 'Negado'),
        ('cancelado', 'Cancelado')
    )
    
    ufs = (
        ('AC', 'Acre'),
        ('AL', 'Alagoas'),
        ('AP', 'Amapá'),
        ('AM', 'Amazonas'),
        ('BA', 'Bahia'),
        ('CE', 'Ceará'),
        ('DF', 'Distrito Federal'),
        ('ES', 'Espírito Santo'),
        ('GO', 'Goiás'),
        ('MA', 'Maranhão'),
        ('MT', 'Mato Grosso'),
        ('MS', 'Mato Grosso do Sul'),
        ('MG', 'Minas Gerais'),
        ('PA', 'Pará'),
        ('PB', 'Paraíba'),
        ('PR', 'Paraná'),
        ('PE', 'Pernambuco'),
        ('PI', 'Piauí'),
        ('RJ', 'Rio de Janeiro'),
        ('RN', 'Rio Grande do Norte'),
        ('RS', 'Rio Grande do Sul'),
        ('RO', 'Rondônia'),
        ('RR', 'Roraima'),
        ('SC', 'Santa Catarina'),
        ('SP', 'São Paulo'),
        ('SE', 'Sergipe'),
        ('TO', 'Tocantins')
    )

class endereco(models.Model):
    rua = models.CharField(max_length=100, blank=False, null=False)
    numero = models.CharField(max_length=10, blank=False, null=False)
    bairro = models.CharField(max_length=100, blank=False, null=False)
    cidade = models.CharField(max_length=100, blank=False, null=False)
    uf = models.CharField(choices=MC().ufs, max_length=2, blank=False, null=False)

class participante(models.Model):
    nome = models.CharField(max_length=100, blank=False, null=False)
    cpf = models.CharField(max_length=11, unique=True, blank=False, null=False)
    email = models.EmailField(blank=False, null=False)
    data_nascimento = models.DateField(blank=False, null=False)
    telefone = models.CharField(max_length=15, blank=False, null=False)
    endereco = models.ForeignKey(endereco, on_delete=models.CASCADE, related_name='participantes')
    # jogar endereço todo aqui
    
class organizador(models.Model):
    valor = models.DecimalField(max_digits=10, decimal_places=2, blank=False, null=False)
    participante = models.ForeignKey(participante, on_delete=models.CASCADE, related_name='organizadores')

class evento(models.Model):
    nome = models.CharField(max_length=100, blank=True, null=True)
    descricao = models.CharField(max_length=50000, null=False, blank=False)
    dataIni = models.DateField(blank=False, null=False)
    dataFim = models.DateField(blank=False, null=False)
    dataIniInsc = models.DateField(blank=False, null=False)
    dataFimInsc = models.DateField(blank=False, null=False)
    limiteQuantInsc = models.PositiveIntegerField(blank=False, null=False)
    quantInscAtual = models.PositiveIntegerField(blank=False, null=False)
    valorInsc = models.DecimalField(max_digits=6, decimal_places=2, blank=False, null=False)
    status = models.CharField(choices=MC().evento_status, max_length=10, default='pendente')
    cidade = models.CharField(max_length=100, blank=False, null=False)
    uf = models.CharField(choices=MC().ufs, max_length=2, blank=False, null=False)
    organizador = models.ForeignKey(organizador, on_delete=models.CASCADE, related_name='eventos')
    # imagens
    