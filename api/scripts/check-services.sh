#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 PitchLab - Status dos Serviços${NC}"
echo "================================"

# Check Docker
if docker info > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker: Rodando${NC}"
else
    echo -e "${RED}❌ Docker: Não está rodando${NC}"
fi

# Check PostgreSQL container
if docker ps | grep -q "postgres"; then
    echo -e "${GREEN}✅ PostgreSQL: Container ativo${NC}"
    
    # Check if database is responding
    if docker exec $(docker ps -q -f name=postgres) pg_isready > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL: Respondendo${NC}"
    else
        echo -e "${YELLOW}⚠️  PostgreSQL: Container ativo mas não respondendo${NC}"
    fi
else
    echo -e "${RED}❌ PostgreSQL: Container não encontrado${NC}"
fi

# Check if API is running (port 3001)
if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API: Rodando em http://localhost:3001${NC}"
    
    # Get health status
    HEALTH=$(curl -s http://localhost:3001/api/health | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [ "$HEALTH" = "ok" ]; then
        echo -e "${GREEN}✅ API Health: OK${NC}"
    else
        echo -e "${YELLOW}⚠️  API Health: $HEALTH${NC}"
    fi
else
    echo -e "${RED}❌ API: Não está rodando na porta 3001${NC}"
fi

# Check if frontend is running (port 3000)
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend: Rodando em http://localhost:3000${NC}"
else
    echo -e "${RED}❌ Frontend: Não está rodando na porta 3000${NC}"
fi

# Check .env file
if [ -f .env ]; then
    echo -e "${GREEN}✅ .env: Arquivo existe${NC}"
    
    # Check for required variables
    if grep -q "DATABASE_URL" .env && grep -q "JWT_SECRET" .env; then
        echo -e "${GREEN}✅ .env: Variáveis básicas configuradas${NC}"
    else
        echo -e "${YELLOW}⚠️  .env: Algumas variáveis podem estar faltando${NC}"
    fi
else
    echo -e "${RED}❌ .env: Arquivo não encontrado${NC}"
fi

echo ""
echo -e "${BLUE}📋 Comandos úteis:${NC}"
echo -e "  ${YELLOW}npm run start:all${NC}    - Iniciar tudo"
echo -e "  ${YELLOW}npm run stop:all${NC}     - Parar todos os serviços"
echo -e "  ${YELLOW}npm run docker:db:logs${NC} - Ver logs do PostgreSQL"
echo -e "  ${YELLOW}npm run db:studio${NC}    - Abrir Prisma Studio"
