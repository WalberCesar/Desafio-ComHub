# PitchLab - Desafio Técnico Fullstack

Miniaplicação de ideação colaborativa com chat em tempo real, ideias votáveis e assistente de IA (via Groq) para resumo, tags e pitch gerados a partir da conversa.

## 🏗️ Arquitetura

```
pitchlab/
├── api/          # Backend (Node.js + TypeScript + Express + Socket.IO)
├── app/          # Frontend (Next.js + TypeScript + Tailwind)
└── README.md     # Este arquivo
```

## 🚀 Funcionalidades

### ✅ Implementadas

- **Salas**: Criar, listar e ingressar
- **Mensagens**: Troca em tempo real por sala com persistência
- **Ideias**: Derivadas da conversa, com voto (+1) em tempo real
- **IA (Groq)**: Resumo, tags e pitch das mensagens da sala
- **Autenticação**: Sistema simples por nome e JWT
- **Tempo Real**: Socket.IO para atualizações instantâneas

### 🔧 Stack Tecnológica

#### Backend (`/api`)
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Tempo Real**: Socket.IO
- **Banco de Dados**: PostgreSQL + Prisma ORM
- **Validação**: Zod
- **IA**: Groq SDK
- **Autenticação**: JWT + bcryptjs

#### Frontend (`/app`)
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **TypeScript**: Tipagem completa
- **Estado**: React Hooks + Context
- **Tempo Real**: Socket.IO Client

## 🛠️ Configuração do Ambiente

### Pré-requisitos

- Node.js 18+
- PostgreSQL (ou Docker)
- Conta Groq (para API key)

### 1. Clonando o Repositório

```bash
git clone [url-do-seu-repositorio]
cd desafio-pitchlab
```

### 2. Configuração do Banco de Dados

#### Opção A: Docker (Recomendado)

```bash
cd api
npm run docker:db:up
```

#### Opção B: PostgreSQL Local

Certifique-se de ter PostgreSQL rodando na porta 5432.

### 3. Configuração da API

```bash
cd api

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Modo desenvolvimento
npm run dev
```

### 4. Configuração do Frontend

```bash
cd app

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.local.example .env.local
# Edite o .env.local com suas configurações

# Modo desenvolvimento
npm run dev
```

## 📋 Variáveis de Ambiente

### API (`.env`)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/pitchlab_db?schema=public"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key"

# Server
PORT=3001
NODE_ENV=development

# CORS
APP_ORIGIN="http://localhost:3000"

# Groq AI
GROQ_API_KEY="your-groq-api-key"
GROQ_MODEL="llama3-8b-8192"
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_WS_URL="http://localhost:3001"
```

## 🎯 Como Usar

1. **Acesse**: http://localhost:3000
2. **Identifique-se**: Digite seu nome ou crie uma conta
3. **Criar Sala**: Clique em "Nova Sala" e defina nome/descrição
4. **Entrar na Sala**: Clique em uma sala existente
5. **Chat**: Digite mensagens que aparecem em tempo real
6. **Ideias**: Crie ideias baseadas na conversa
7. **Votar**: Clique no botão +1 para votar em ideias
8. **IA**: Use os botões para gerar resumo, tags ou pitch

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar usuário
- `POST /api/auth/login` - Login
- `POST /api/auth/identify` - Identificação simples

### Salas
- `GET /api/rooms` - Listar salas
- `POST /api/rooms` - Criar sala

### Mensagens
- `GET /api/messages/:roomId` - Histórico (paginado)
- `POST /api/messages` - Enviar mensagem

### Ideias
- `GET /api/ideas/:roomId` - Listar ideias
- `POST /api/ideas` - Criar ideia
- `POST /api/ideas/:id/vote` - Votar em ideia

### IA
- `POST /api/ai/summary/:roomId` - Resumo da sala
- `POST /api/ai/tags/:roomId` - Tags sugeridas
- `POST /api/ai/pitch/:roomId` - Pitch estruturado

### Utilidades
- `GET /api/health` - Health check

## 🔄 Eventos Socket.IO

### Cliente → Servidor
- `join-room` - Entrar em sala
- `send-message` - Enviar mensagem
- `typing` - Indicar digitação

### Servidor → Cliente
- `message` - Nova mensagem
- `idea` - Nova ideia
- `vote` - Novo voto
- `user-typing` - Usuário digitando
- `ai-response` - Resposta da IA

## 🗄️ Modelagem do Banco

```prisma
model User {
  id       String @id @default(cuid())
  name     String
  email    String? @unique
  password String?
  isGuest  Boolean @default(true)
  // relações...
}

model Room {
  id          String @id @default(cuid())
  name        String
  description String?
  // relações...
}

model Message {
  id      String @id @default(cuid())
  content String
  role    MessageRole @default(USER)
  // relações...
}

model Idea {
  id          String @id @default(cuid())
  title       String
  description String?
  votes       Int @default(0)
  // relações...
}
```

## 🧪 Comandos Disponíveis

### API
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar produção
npm run db:generate  # Gerar cliente Prisma
npm run db:migrate   # Executar migrações
npm run db:studio    # Prisma Studio
npm run docker:db:up # Subir PostgreSQL via Docker
```

### Frontend
```bash
npm run dev          # Desenvolvimento
npm run build        # Build para produção
npm run start        # Iniciar produção
npm run lint         # Linting
```

## 🔐 Segurança

- ✅ CORS restrito ao domínio do frontend
- ✅ Validação de entrada com Zod
- ✅ Sanitização de dados
- ✅ JWT para autenticação
- ✅ Senhas hasheadas com bcrypt
- ✅ Variáveis de ambiente para segredos

## 📊 Observabilidade

- ✅ Logs estruturados
- ✅ Health check endpoint
- ✅ Tratamento de erros consistente
- ✅ Monitoramento de performance

## 🚀 Deploy

### Preparação
1. Configure variáveis de ambiente de produção
2. Execute `npm run build` em ambos os projetos
3. Configure PostgreSQL para produção

### Sugestões de Plataformas
- **API**: Railway, Render, Heroku
- **Frontend**: Vercel, Netlify
- **Banco**: Supabase, Railway, AWS RDS

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido como parte de um desafio técnico.

---

**Desenvolvido por**: [Seu Nome]  
**Data**: [Data de Desenvolvimento]  
**Tempo**: 48 horas (Desafio Técnico)
