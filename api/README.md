# PitchLab API

Aplicação de backend para plataforma colaborativa de ideação com chat em tempo real, ideias votáveis e assistente de IA.

## 🚀 Tecnologias Utilizadas

- **Node.js** + **TypeScript**
- **Express.js** (API REST)
- **Socket.IO** (comunicação em tempo real)
- **Prisma** (ORM)
- **PostgreSQL** (banco de dados)
- **Zod** (validação de dados)
- **Docker** (PostgreSQL containerizado)

## 📋 Pré-requisitos

- Node.js 18+ 
- npm ou yarn
- Docker e Docker Compose

## 🛠️ Configuração do Ambiente

### Opção 1: Setup Automático (Recomendado)

Execute o script de configuração automática:

```bash
# Torna o script executável
chmod +x scripts/dev-setup.sh

# Executa a configuração completa
./scripts/dev-setup.sh
```

Este script irá:
- Verificar dependências
- Instalar pacotes npm
- Iniciar PostgreSQL via Docker
- Configurar Prisma
- Executar migrações
- Opcionalmente popular o banco com dados de exemplo

### Opção 2: Setup Manual

1. **Clone o repositório e instale as dependências:**
```bash
npm install
```

2. **Configure as variáveis de ambiente:**
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

3. **Inicie o PostgreSQL via Docker:**
```bash
npm run docker:db:up
```

4. **Configure o Prisma:**
```bash
# Gerar o cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# (Opcional) Popular com dados de exemplo
npm run db:seed
```

## 🎯 Scripts Disponíveis

### Desenvolvimento
- `npm run dev` - Inicia o servidor em modo desenvolvimento
- `npm run build` - Compila o TypeScript
- `npm run start` - Inicia o servidor compilado

### Banco de Dados
- `npm run db:generate` - Gera o cliente Prisma
- `npm run db:migrate` - Executa migrações
- `npm run db:studio` - Abre o Prisma Studio
- `npm run db:seed` - Popula o banco com dados de exemplo
- `npm run db:reset` - Reseta o banco de dados

### Docker (PostgreSQL)
- `npm run docker:db:up` - Inicia PostgreSQL via Docker
- `npm run docker:db:down` - Para o PostgreSQL
- `npm run docker:db:logs` - Visualiza logs do PostgreSQL
- `npm run docker:db:reset` - Reseta completamente o PostgreSQL

### Configuração
- `npm run setup` - Instala dependências e gera cliente Prisma
- `npm run setup:docker` - Setup completo com Docker

## 🌐 Endpoints da API

### Saúde
- `GET /api/health` - Status da aplicação

### Salas
- `GET /api/rooms` - Listar todas as salas
- `POST /api/rooms` - Criar nova sala
- `GET /api/rooms/:id` - Obter detalhes de uma sala

### Mensagens
- `GET /api/messages/:roomId` - Listar mensagens de uma sala (paginadas)
- `POST /api/messages` - Enviar nova mensagem

### Ideias
- `GET /api/ideas/:roomId` - Listar ideias de uma sala
- `POST /api/ideas` - Criar nova ideia
- `POST /api/ideas/:id/vote` - Votar em uma ideia

### IA (Futuramente)
- `POST /api/ai/summary` - Gerar resumo das mensagens
- `POST /api/ai/tags` - Sugerir tags
- `POST /api/ai/pitch` - Gerar pitch estruturado

## 🔌 Eventos Socket.IO

### Cliente → Servidor
- `join-room` - Entrar em uma sala
- `leave-room` - Sair de uma sala
- `send-message` - Enviar mensagem
- `typing` - Indicar que está digitando
- `stop-typing` - Parar de digitar

### Servidor → Cliente
- `message` - Nova mensagem recebida
- `new-idea` - Nova ideia criada
- `idea-voted` - Voto atualizado em ideia
- `user-typing` - Usuário digitando
- `user-stopped-typing` - Usuário parou de digitar

## 🗄️ Estrutura do Banco de Dados

O banco utiliza o seguinte schema:

- **User** - Usuários da plataforma
- **Room** - Salas de conversa
- **Message** - Mensagens (usuário ou assistente IA)
- **Idea** - Ideias compartilhadas
- **Vote** - Votos nas ideias
- **Tag** - Tags para categorização

Veja o arquivo `prisma/schema.prisma` para detalhes completos.

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente

Todas as variáveis necessárias estão documentadas no arquivo `.env.example`:

- `PORT` - Porta do servidor (padrão: 3001)
- `DATABASE_URL` - URL de conexão PostgreSQL
- `APP_ORIGIN` - URL do frontend para CORS
- `GROQ_API_KEY` - Chave da API Groq para IA
- `GROQ_MODEL` - Modelo Groq a ser utilizado

### Docker PostgreSQL

O projeto inclui um `docker-compose.postgres.yml` configurado especificamente para desenvolvimento:

- **Container**: `pitchlab-postgres`
- **Porta**: `5432`
- **Banco**: `pitchlab_db`
- **Usuário**: `pitchlab`
- **Senha**: `pitchlab123`

### Prisma Studio

Para visualizar e editar dados graficamente:

```bash
npm run db:studio
```

Acesse: http://localhost:5555

## 🧪 Testes

```bash
npm test
```

*Nota: Testes ainda não implementados - previstos para Dia 2 do roadmap*

## 📁 Estrutura do Projeto

```
api/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   ├── seed.ts           # Dados iniciais
│   └── migrations/       # Migrações do banco
├── scripts/
│   └── dev-setup.sh      # Script de configuração
├── src/
│   ├── controllers/      # Controladores da API
│   ├── middleware/       # Middlewares personalizados
│   ├── routes/          # Definição das rotas
│   ├── services/        # Serviços (database, socket, etc.)
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilitários
│   └── index.ts         # Arquivo principal
├── docker-compose.postgres.yml  # Docker para PostgreSQL
├── .env.example         # Exemplo de variáveis de ambiente
└── README.md           # Este arquivo
```

## 🚦 Status do Desenvolvimento

### ✅ Concluído (Dia 1)
- [x] Configuração do repositório
- [x] PostgreSQL via Docker Compose
- [x] Schema Prisma configurado
- [x] API REST básica estruturada
- [x] Socket.IO configurado
- [x] Rotas para salas, mensagens e ideias
- [x] Middleware de segurança
- [x] Scripts de desenvolvimento

### 🔄 Em Desenvolvimento (Dia 2)
- [ ] Integração com Groq (IA)
- [ ] Paginação por cursor nas mensagens
- [ ] Indicador "digitando..."
- [ ] Validações robustas
- [ ] Testes essenciais
- [ ] Melhorias de observabilidade

## 🤝 Como Contribuir

1. Clone o repositório
2. Execute o setup automático: `./scripts/dev-setup.sh`
3. Faça suas alterações
4. Teste localmente
5. Submeta um pull request

## 📄 Licença

Este projeto foi desenvolvido como parte de um desafio técnico.

---

**PitchLab** - Plataforma colaborativa de ideação 🚀