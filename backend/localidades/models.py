from django.db import models

class localidade(models.Model):
    cidade = models.CharField(max_length=100, blank=False, null=False)
    uf = models.CharField(max_length=2, blank=False, null=False)
