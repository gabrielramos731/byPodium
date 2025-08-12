# Sistema de Pagamento Simulado - byPodium

## Visão Geral

Este sistema implementa uma simulação completa de gateway de pagamento para o byPodium, permitindo que usuários completem o processo de inscrição em eventos através de um fluxo de pagamento fictício.

## Funcionalidades Implementadas

### 1. Gateway de Pagamento Simulado
- **URL**: `/gateway/payment/{inscricao_id}/`
- Interface completa de gateway com design profissional
- Suporte a 3 métodos de pagamento:
  - **PIX**: Processamento instantâneo (1-2 segundos)
  - **Cartão**: Processamento rápido (3-5 segundos)
  - **Boleto**: Processamento moderado (5-10 segundos)

### 2. Validações e Máscaras
- Validação de campos obrigatórios por método de pagamento
- Máscaras automáticas para:
  - Número do cartão (formatação com espaços)
  - Data de validade (MM/AA)
  - CVV (apenas números)

### 3. Processamento Simulado
- Taxa de aprovação de 95% (simulando falhas reais)
- Diferentes tempos de processamento por método
- Atualização automática do status de pagamento e inscrição

### 4. Páginas de Resultado
- **Sucesso**: Página com confirmação e detalhes do pagamento
- **Erro**: Página com informações de falha e opções de retry

## Fluxo de Funcionamento

### 1. Criação de Inscrição
```
POST /api/eventos/{event_id}/criar
```
**Resposta inclui:**
```json
{
  "id": 123,
  "status": "pendente",
  "payment_url": "/gateway/payment/123/",
  "needs_payment": true,
  ...outros dados da inscrição
}
```

### 2. Redirecionamento para Gateway
O usuário é redirecionado para a URL de pagamento onde encontra:
- Resumo da inscrição e valores
- Formulário de pagamento com validações
- Interface responsiva e segura

### 3. Processamento do Pagamento
```
POST /gateway/process/{inscricao_id}/
```
**Payload:**
```json
{
  "metodo_pagamento": "pix|cartao|boleto"
}
```

### 4. Atualização Automática
- **Pagamento aprovado**:
  - Status do pagamento: `pendente` → `pago`
  - Status da inscrição: `pendente` → `confirmada`
- **Pagamento rejeitado**:
  - Usuário pode tentar novamente

### 5. Verificação de Status
```
GET /api/payment/status/{inscricao_id}/
```
**Resposta para pagamento realizado:**
```json
{
  "has_payment": true,
  "payment_status": "pago",
  "payment_method": "pix",
  "payment_amount": "50.00",
  "payment_date": "10/08/2025",
  "inscription_status": "confirmada"
}
```

**Resposta para pagamento pendente:**
```json
{
  "has_payment": false,
  "payment_status": "pendente",
  "inscription_status": "pendente",
  "payment_url": "/gateway/payment/123/"
}
```

## Como Testar

### 1. Configuração Inicial
```bash
# Backend
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

### 2. Teste do Fluxo Completo

1. **Fazer login no sistema**
2. **Escolher um evento** e clicar em "Inscrever-se"
3. **Preencher dados** da inscrição
4. **Submeter inscrição** - receberá link de pagamento
5. **Acessar gateway** via link fornecido
6. **Escolher método** de pagamento
7. **Preencher dados** fictícios (qualquer coisa)
8. **Clicar em "Processar Pagamento"**
9. **Aguardar processamento** (varia por método)
10. **Ver resultado** na página de sucesso/erro

### 3. URLs de Teste Direto

#### Acessar Gateway Diretamente:
```
http://localhost:8000/gateway/payment/{inscricao_id}/
```

#### Verificar Status:
```
http://localhost:8000/api/payment/status/{inscricao_id}/
```

### 4. Dados de Teste

Para testes, use qualquer dado fictício:
- **Cartão**: `1234 5678 9012 3456`
- **Validade**: `12/25`
- **CVV**: `123`
- **Nome**: `TESTE USUARIO`
- **PIX**: `123.456.789-00`
- **Email**: `teste@exemplo.com`

## Características Técnicas

### Backend (Django)
- **Models**: Reutilização dos modelos existentes `inscricao` e `pagamento`
- **Views**: Views baseadas em classe para melhor organização
- **URLs**: Rotas RESTful organizadas
- **Templates**: HTML com CSS e JavaScript vanilla

### Frontend (React)
- **Componente**: `PaymentFlow.jsx` para verificação de status
- **Estilização**: CSS modular e responsivo
- **API**: Integração com endpoints de pagamento

### Segurança
- **CSRF Protection**: Desabilitado apenas para o endpoint de processamento
- **Validação**: Validações tanto no frontend quanto backend
- **Autenticação**: Endpoints protegidos por token JWT

## Simulação Realística

### Métodos de Pagamento
- **PIX**: Interface com campo de CPF/CNPJ
- **Cartão**: Formulário completo com máscaras
- **Boleto**: Campo de email para envio

### Taxa de Sucesso
- **95% de aprovação** para simular cenário real
- **5% de falha** para testar fluxo de erro

### Tempos de Processamento
- **PIX**: 1-2 segundos (instantâneo)
- **Cartão**: 3-5 segundos (processamento online)
- **Boleto**: 5-10 segundos (geração de documento)

## Integração com Sistema Existente

### 1. Modificação Mínima
- Reutilização de modelos existentes
- Adição de campos na resposta da API de inscrição
- Novo endpoint para verificação de status

### 2. Compatibilidade
- Mantém funcionalidade existente
- Adiciona funcionalidade de pagamento opcional
- Não quebra fluxos existentes

### 3. Extensibilidade
- Fácil adição de novos métodos de pagamento
- Possibilidade de integração com gateway real
- Estrutura preparada para notificações automáticas

## Próximos Passos (Opcional)

1. **Notificações**: Email automático após pagamento
2. **Webhooks**: Simulação de callbacks de gateway
3. **Relatórios**: Dashboard de pagamentos para admin
4. **Boleto**: Geração de PDF fictício
5. **PIX**: QR Code simulado

---

**Nota**: Este é um sistema de simulação para fins educacionais. Nenhuma cobrança real é efetuada e todos os dados são fictícios.
