from django.core.management.base import BaseCommand
import sys
import pandas as pd
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))
from localidades.models import localidade

class Command(BaseCommand):
    help = 'Importa localidades do arquivo CSV'
    
    def handle(self, *args, **kwargs):
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        caminho_csv = os.path.join(BASE_DIR, 'data_aux', 'dicionario_municipios.csv')
        
        df = pd.read_csv(caminho_csv, usecols=['nome', 'sigla_uf']).dropna()
        
        for _, row in df.iterrows():
            nome = row['nome'].strip()
            sigla = row['sigla_uf'].strip().upper()
            obj, created = localidade.objects.get_or_create(cidade=nome, uf=sigla)
            