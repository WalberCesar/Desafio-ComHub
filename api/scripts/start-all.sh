#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 PitchLab API - Inicialização Completa${NC}"
echo "======================================"

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  Arquivo .env não encontrado. Copiando .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}🔧 Por favor, edite o arquivo .env com suas configurações antes de continuar.${NC}"
    echo -e "${YELLOW}   Especialmente: DATABASE_URL, JWT_SECRET, GROQ_API_KEY${NC}"
    read -p "Pressione Enter depois de configurar o .env..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências...${NC}"
    npm install
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker não está rodando. Por favor, inicie o Docker primeiro.${NC}"
    exit 1
fi

echo -e "${BLUE}🐳 Iniciando PostgreSQL via Docker...${NC}"
npm run docker:db:up

# Wait for database to be ready
echo -e "${YELLOW}⏳ Aguardando banco de dados ficar pronto...${NC}"
sleep 10

# Check if database is accessible
echo -e "${BLUE}🔧 Verificando conexão com banco de dados...${NC}"
if ! npm run db:generate > /dev/null 2>&1; then
    echo -e "${RED}❌ Erro ao conectar com banco de dados. Verifique as configurações.${NC}"
    exit 1
fi

echo -e "${BLUE}🗄️  Executando migrações...${NC}"
npm run db:migrate

echo -e "${BLUE}🌱 Populando banco com dados de exemplo...${NC}"
npm run db:seed

echo -e "${GREEN}✅ Setup completo! Iniciando servidor...${NC}"
echo -e "${BLUE}🌐 API estará disponível em: http://localhost:3001${NC}"
echo -e "${BLUE}🏥 Health check: http://localhost:3001/api/health${NC}"
echo -e "${BLUE}📊 Prisma Studio: npm run db:studio${NC}"
echo ""
echo -e "${YELLOW}Para parar todos os serviços: npm run stop:all${NC}"
echo ""

# Start the development server
npm run dev
