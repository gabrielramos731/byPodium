from .models import evento, endereco, participante, organizador
from django.contrib import admin

class EventoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'dataIni', 'dataFim', 'cidade')

class EnderecoAdmin(admin.ModelAdmin):
    list_display = ('rua', 'numero', 'bairro', 'cidade', 'uf')
    
class ParticipanteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cpf', 'email', 'data_nascimento', 'telefone')
    
class OrganizadorAdmin(admin.ModelAdmin):
    list_display = ('participante', 'valor')

admin.site.register(evento, EventoAdmin)
admin.site.register(endereco, EnderecoAdmin)
admin.site.register(participante, ParticipanteAdmin)
admin.site.register(organizador, OrganizadorAdmin)

