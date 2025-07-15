# byPodium - Sistema de Gerenciamento de Eventos Esportivos

Uma aplicação completa para gerenciamento de eventos esportivos, desenvolvida com Django REST Framework no backend e React no frontend.

## Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação](#instalação)
- [Uso da API](#uso-da-api)
- [Estrutura do Projeto](#estrutura-do-projeto)

## Visão Geral

O **byPodium** é uma plataforma desenvolvida para facilitar a organização e participação em eventos esportivos. O sistema permite que organizadores criem eventos, definam categorias e kits, enquanto participantes podem se inscrever facilmente através de uma interface moderna e intuitiva.

### Principais Características

- **Gestão Completa de Eventos** - Criação, edição e controle de eventos esportivos
- **Sistema de Inscrições** - Processo simplificado de inscrição com validações automáticas
- **Categorias e Kits** - Classificação por idade/sexo e opções de kits personalizados
- **Controle de Vagas** - Limite de participantes e status de inscrições em tempo real
- **API RESTful** - Interface de programação robusta e bem documentada
- **Documentação Automática** - Swagger/OpenAPI integrado
- **Interface Moderna** - Frontend React responsivo e intuitivo

## Funcionalidades

### Gestão de Eventos
- Criação e edição de eventos com informações completas
- Controle de datas de início/fim e períodos de inscrição
- Upload de imagens promocionais
- Status automático de eventos (ativo, encerrado, etc.)

### Sistema de Participantes
- Cadastro completo com dados pessoais e endereço
- Histórico de inscrições e eventos participados
- Perfil de organizadores com eventos criados

### Categorias e Kits
- Categorias por faixa etária e sexo
- Kits personalizáveis com itens específicos
- Preços extras para kits premium

### Inscrições Inteligentes
- Validação automática de período de inscrições
- Controle de vagas disponíveis
- Status de inscrição em tempo real
- Cancelamento de inscrições

### Sistema de Pagamentos
- Múltiplos métodos (Atualemte PIX)
- Controle de status de pagamento
- Histórico de transações

## Tecnologias

### Backend
- **Django 5.2.4** - Framework web Python
- **Django REST Framework 3.16.0** - API RESTful

### Frontend
- **React** - Biblioteca para interfaces de usuário
- **Vite** - Build tool e dev server
- **Axios** - Cliente HTTP para requisições API

### Banco de Dados
- **SQLite** - Desenvolvimento (facilmente substituível por PostgreSQL/MySQL)

## Instalação

### Backend (Django)

```bash
# Clone e navegue para o backend
git clone https://github.com/seu-usuario/byPodium.git
cd byPodium/backend

# Crie e ative o ambiente virtual
python -m venv .venv
source .venv/bin/activate  # Linux/Mac

# Instale dependências e configure
pip install -r requirements.txt
python manage.py migrate
python manage.py importa_localidades
python manage.py runserver
```

### Frontend (React)

```bash
# Navegue para o frontend
cd ../frontend

# Instale dependências e execute
npm install
echo "VITE_API_URL=http://localhost:8000/api" > .env
npm run dev
```

##  Uso da API

A documentação completa da API está disponível através do Swagger UI:

- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/

### Endpoints Principais

- `GET /api/eventos/` - Lista eventos
- `GET /api/eventos/{id}/` - Detalhes do evento
- `GET /api/eventos/{id}/criar/` - Opções para inscrição
- `POST /api/eventos/{id}/criar/` - Criar inscrição
- `DELETE /api/eventos/{id}/criar/` - Cancelar inscrição
- `GET /api/inscricoes/` - Lista inscrições do usuário
- `GET /api/perfil/` - Dados do participante

##  Estrutura do Projeto

```
byPodium/
├── backend/                 # Django REST API
│   ├── evento/             # Gestão de eventos, categorias, kits e itens
│   ├── usuarios/           # Participantes e organizadores
│   ├── inscricoes/         # Processo de inscrições e pagamentos
│   ├── localidades/        # Dados geográficos (cidades/estados)
│   └── byPodiumProject/    # Configurações principais
└── frontend/               # React Application
    ├── src/
    │   ├── components/     # Componentes reutilizáveis
    │   ├── pages/          # Páginas da aplicação
    │   └── utils/          # Utilitários e API calls
```


##  Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Nova funcionalidade'`)
4. Push para a branch (`git push origin feature/Funcionalidade`)
5. Abra um Pull Request

##  Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
