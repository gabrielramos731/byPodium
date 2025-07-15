from .models import evento, categoria, kit, item
from localidades.models import localidade
from usuarios.models import participante, organizador
from inscricoes.models import inscricao, pagamento
from django.contrib import admin


class EventoAdmin(admin.ModelAdmin):
    list_display = ('nome', 'dataIni', 'dataFim', 'get_organizador_nome')

    def get_organizador_nome(self, obj):
        return obj.organizador.participante.nome
    get_organizador_nome.short_description = 'Organizador'

class LocalidadeAdmin(admin.ModelAdmin):
    list_display = ('cidade', 'uf')
    
class ParticipanteAdmin(admin.ModelAdmin):
    list_display = ('nome', 'cpf', 'email', 'data_nascimento', 'telefone')
    
class OrganizadorAdmin(admin.ModelAdmin):
    list_display = ('participante', 'valor')

class InscricaoAdmin(admin.ModelAdmin):
    list_display = ('dataInsc','status','evento','participante', 'categoria', 'kit')

class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('nome', 'sexo', 'idadeMin', 'idadeMax', 'evento')

class KitAdmin(admin.ModelAdmin):
    list_display = ('nome', 'precoExtra', 'evento')
    
class ItemAdmin(admin.ModelAdmin):
    list_display = ('nome', 'tamanho')
    filter_horizontal = ('kit',)

class PagamentoAdmin(admin.ModelAdmin):
    list_display = ('inscricao', 'status', 'valor', 'metodoPagamento', 'dataPagamento')

admin.site.register(evento, EventoAdmin)
admin.site.register(localidade, LocalidadeAdmin)
admin.site.register(participante, ParticipanteAdmin)
admin.site.register(organizador, OrganizadorAdmin)
admin.site.register(inscricao, InscricaoAdmin)
admin.site.register(categoria, CategoriaAdmin)
admin.site.register(kit, KitAdmin)
admin.site.register(item, ItemAdmin)
admin.site.register(pagamento, PagamentoAdmin)
