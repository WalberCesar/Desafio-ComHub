#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

clear
echo -e "${PURPLE}"
echo "  ____  _ _       _     _          _     "
echo " |  _ \\(_) |     | |   | |        | |    "
echo " | |_) |_| |_ ___| |__ | |     __ _| |__  "
echo " |  _ <| | __/ __| '_ \\| |    / _\` | '_ \\ "
echo " | |_) | | || (__| | | | |___| (_| | |_) |"
echo " |____/|_|\\__\\___|_| |_|______\\__,_|_.__/ "
echo -e "${NC}"
echo -e "${BLUE}🚀 Setup Completo da Aplicação PitchLab${NC}"
echo "========================================"
echo ""

# Check if running from correct directory
if [ ! -f "package.json" ] && [ ! -d "api" ] && [ ! -d "app" ]; then
    echo -e "${RED}❌ Execute este script na raiz do projeto PitchLab${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Verificando pré-requisitos...${NC}"

# Check Node.js
if command -v node > /dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js não encontrado. Instale Node.js 18+ primeiro.${NC}"
    exit 1
fi

# Check npm
if command -v npm > /dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm não encontrado.${NC}"
    exit 1
fi

# Check Docker
if command -v docker > /dev/null 2>&1; then
    if docker info > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker: Rodando${NC}"
    else
        echo -e "${YELLOW}⚠️  Docker instalado mas não está rodando${NC}"
        echo -e "${BLUE}   Iniciando Docker...${NC}"
        # Try to start Docker (this may vary by system)
        if ! docker info > /dev/null 2>&1; then
            echo -e "${RED}❌ Não foi possível iniciar Docker. Inicie manualmente.${NC}"
            exit 1
        fi
    fi
else
    echo -e "${RED}❌ Docker não encontrado. Instale Docker primeiro.${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📦 Configurando Backend (API)...${NC}"
echo "================================"

cd api

# Check and copy .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Criando arquivo .env da API...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ Arquivo .env criado. Você pode editá-lo depois se necessário.${NC}"
fi

# Install API dependencies
echo -e "${BLUE}📦 Instalando dependências da API...${NC}"
npm install

cd ..

echo ""
echo -e "${BLUE}💻 Configurando Frontend (APP)...${NC}"
echo "================================="

cd app

# Check and copy .env.local
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}📝 Criando arquivo .env.local do frontend...${NC}"
    cp .env.local.example .env.local
    echo -e "${GREEN}✅ Arquivo .env.local criado.${NC}"
fi

# Install APP dependencies
echo -e "${BLUE}📦 Instalando dependências do frontend...${NC}"
npm install

cd ..

echo ""
echo -e "${GREEN}🎉 Setup concluído com sucesso!${NC}"
echo ""
echo -e "${BLUE}🚀 Para iniciar a aplicação:${NC}"
echo ""
echo -e "${YELLOW}1. Iniciar apenas a API:${NC}"
echo -e "   cd api && npm run start:all"
echo ""
echo -e "${YELLOW}2. Iniciar o frontend (em outro terminal):${NC}"
echo -e "   cd app && npm run dev"
echo ""
echo -e "${YELLOW}3. Verificar status dos serviços:${NC}"
echo -e "   cd api && npm run status"
echo ""
echo -e "${BLUE}🌐 URLs da aplicação:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   API: ${GREEN}http://localhost:3001${NC}"
echo -e "   Health Check: ${GREEN}http://localhost:3001/api/health${NC}"
echo -e "   Prisma Studio: ${GREEN}cd api && npm run db:studio${NC}"
echo ""
echo -e "${BLUE}📚 Documentação completa disponível no README.md${NC}"
