from django.db import models

class MC:
    evento_status = (
        ('pendente', 'Pendente'),
        ('ativo', 'Ativo'),
        ('negado', 'Negado'),
        ('cancelado', 'Cancelado')
    )
    sexo = (
        ('M','Masculino'),
        ('F','Feminino'),
    )
    tamanhos = (
        ('pp','PP'),
        ('p', 'P'),
        ('m', 'M'),
        ('g', 'G'),
        ('gg', 'GG')
    )

class evento(models.Model):
    nome = models.CharField(max_length=100, blank=True, null=True)
    descricao = models.CharField(max_length=50000, null=False, blank=False)
    horarioIni = models.TimeField(blank=False, null=False, default='00:00:00')
    dataIni = models.DateField(blank=False, null=False)
    dataFim = models.DateField(blank=False, null=False)
    dataIniInsc = models.DateField(blank=False, null=False)
    dataFimInsc = models.DateField(blank=False, null=False)
    limiteQuantInsc = models.PositiveIntegerField(blank=False, null=False)
    quantInscAtual = models.PositiveIntegerField(blank=False, null=False, default=0)
    valorInsc = models.DecimalField(max_digits=6, decimal_places=2, blank=False, null=False)
    status = models.CharField(choices=MC().evento_status, max_length=10, default='pendente')
    organizador = models.ForeignKey('usuarios.organizador', on_delete=models.CASCADE, related_name='eventos')
    localidade = models.ForeignKey('localidades.localidade', on_delete=models.CASCADE, related_name='eventos', default=1)
    imagem = models.ImageField(upload_to='', null=True, blank=True)

class categoria(models.Model):
    nome = models.CharField(max_length=20, null=False, blank=True)
    sexo = models.CharField(choices=MC().sexo, max_length=10)
    idadeMin = models.IntegerField(null=False, blank=False, default=0)
    idadeMax = models.IntegerField(null=False, blank=False, default=0)
    evento = models.ForeignKey(evento, on_delete=models.CASCADE, related_name='categorias')

class kit(models.Model):
    nome = models.CharField(max_length=60, null=True, blank=True)
    precoExtra = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    evento = models.ForeignKey(evento, on_delete=models.CASCADE, related_name='kits')

class item(models.Model):
    nome = models.CharField(max_length=30, null=True, blank=True)
    tamanho = models.CharField(choices=MC().tamanhos, max_length=2, null=True, blank=True)
    kit = models.ManyToManyField(kit, related_name='itens')
