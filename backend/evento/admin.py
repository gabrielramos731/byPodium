from .models import evento, localidade, participante, organizador, inscricao
from django.contrib import admin


class EventoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'dataIni', 'dataFim')

class LocalidadeAdmin(admin.ModelAdmin):
    list_display = ('cidade', 'uf')
    
class ParticipanteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cpf', 'email', 'data_nascimento', 'telefone')
    
class OrganizadorAdmin(admin.ModelAdmin):
    list_display = ('participante', 'valor')

class InscricaoAdmin(admin.ModelAdmin):
    list_display = ('dataInsc','status','evento','participante')

admin.site.register(evento, EventoAdmin)
admin.site.register(localidade, LocalidadeAdmin)
admin.site.register(participante, ParticipanteAdmin)
admin.site.register(organizador, OrganizadorAdmin)
admin.site.register(inscricao,InscricaoAdmin)
