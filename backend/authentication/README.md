# Sistema de Autenticação - byPodium

## Overview

Este sistema implementa o **Caso de Uso UC07 - Autenticação do usuário** conforme especificado.

## Funcionalidades Implementadas

### 1. Registro de Usuário (FA-1)
- **Endpoint**: `POST /api/auth/register/`
- **Campos obrigatórios**:
  - `email` (único)
  - `password` (mínimo 6 caracteres)
  - `nome`
  - `cpf` (único)
  - `data_nascimento`
  - `telefone`
  - `rua`
  - `numero`
  - `bairro`
  - `localidade` (ID da localidade)

### 2. Login de Usuário (Cenário Principal)
- **Endpoint**: `POST /api/auth/login/`
- **Campos**:
  - `email`
  - `password`

### 3. Perfil do Usuário
- **Endpoint**: `GET /api/auth/profile/` (autenticado)
- Retorna dados completos do usuário e participante

### 4. Logout
- **Endpoint**: `POST /api/auth/logout/` (autenticado)
- Invalida o token JWT

### 5. Validações
- **Endpoint**: `GET /api/auth/check-email/?email=teste@email.com`
- **Endpoint**: `GET /api/auth/check-cpf/?cpf=12345678901`

## Exemplos de Uso

### Registro
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "minhasenha123",
    "nome": "João Silva",
    "cpf": "12345678901",
    "data_nascimento": "1990-01-15",
    "telefone": "11999999999",
    "rua": "Rua das Flores",
    "numero": "123",
    "bairro": "Centro",
    "localidade": 1
  }'
```

**Resposta de Sucesso:**
```json
{
  "message": "Usuário cadastrado com sucesso",
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "nome": "João Silva"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

**Resposta de Erro (FE-1):**
```json
{
  "error": "Campos obrigatórios não preenchidos",
  "details": {
    "email": ["Este campo é obrigatório."],
    "cpf": ["Este CPF já está cadastrado."]
  }
}
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "password": "minhasenha123"
  }'
```

**Resposta de Sucesso:**
```json
{
  "message": "Login realizado com sucesso",
  "user": {
    "id": 1,
    "email": "usuario@exemplo.com",
    "nome": "João Silva",
    "participante": {
      "id": 1,
      "nome": "João Silva",
      "cpf": "12345678901",
      "telefone": "11999999999"
    }
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }
}
```

**Resposta de Erro (FE-2):**
```json
{
  "error": {
    "non_field_errors": ["E-mail ou senha incorretos"]
  }
}
```

### Acessar Perfil (Autenticado)
```bash
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Logout
```bash
curl -X POST http://localhost:8000/api/auth/logout/ \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refresh": "SEU_REFRESH_TOKEN"}'
```

## Autenticação JWT

O sistema usa **JWT (JSON Web Tokens)** para autenticação:

- **Access Token**: Válido por 1 hora
- **Refresh Token**: Válido por 7 dias
- **Header**: `Authorization: Bearer {access_token}`

### Renovar Token
```bash
curl -X POST http://localhost:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{"refresh": "SEU_REFRESH_TOKEN"}'
```

## Integração com Frontend

### 1. Armazenar Tokens
```javascript
// Após login/registro bem-sucedido
localStorage.setItem('access_token', response.data.tokens.access);
localStorage.setItem('refresh_token', response.data.tokens.refresh);
```

### 2. Interceptar Requisições
```javascript
// Adicionar token automaticamente
axios.defaults.headers.common['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
```

### 3. Renovar Token Automaticamente
```javascript
// Interceptar respostas 401 e renovar token
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      try {
        const response = await axios.post('/api/auth/token/refresh/', {
          refresh: refreshToken
        });
        localStorage.setItem('access_token', response.data.access);
        return axios.request(error.config);
      } catch (refreshError) {
        // Redirecionar para login
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## Fluxos de Erro Tratados

### FE-1: Campos obrigatórios não preenchidos
- Validação no serializer
- Retorna campos específicos com erro

### FE-2: Credenciais inválidas
- Validação no authenticate()
- Mensagem: "E-mail ou senha incorretos"

### FE-3: Cancelamento (Frontend)
- Implementar no modal de login/registro

## Modelos Atualizados

### Participante
- Adicionada relação `OneToOneField` com `User`
- Mantém compatibilidade com dados existentes

### Considerações de Migração
- Campo `user` é opcional (null=True, blank=True)
- Participantes existentes não são afetados
- Novos participantes devem ter usuário associado

## Próximos Passos

1. **Executar migrações**:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

2. **Instalar dependências**:
   ```bash
   pip install djangorestframework-simplejwt==5.3.0
   ```

3. **Atualizar views existentes** para usar `request.user` em vez de pk=1

4. **Implementar frontend** com modais de login/registro

5. **Configurar middleware de CORS** para produção
