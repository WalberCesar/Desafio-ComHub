#!/bin/bash

# PitchLab API - Script de Configuração para Desenvolvimento
# Este script configura o ambiente de desenvolvimento com PostgreSQL via Docker

set -e

echo "🚀 PitchLab API - Configuração do Ambiente de Desenvolvimento"
echo "=============================================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCESSO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado. Por favor, instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose não está instalado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

print_status "Docker e Docker Compose encontrados ✅"

# Verificar se o arquivo .env existe
if [ ! -f ".env" ]; then
    print_warning "Arquivo .env não encontrado. Copiando de .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_success "Arquivo .env criado a partir do .env.example"
        print_warning "⚠️  IMPORTANTE: Edite o arquivo .env com suas configurações reais antes de prosseguir!"
        read -p "Pressione Enter para continuar após editar o .env..."
    else
        print_error "Arquivo .env.example não encontrado!"
        exit 1
    fi
fi

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado. Por favor, instale o Node.js primeiro."
    exit 1
fi

print_status "Node.js encontrado: $(node --version) ✅"

# Instalar dependências
print_status "Instalando dependências do projeto..."
npm install

# Iniciar PostgreSQL via Docker
print_status "Iniciando PostgreSQL via Docker..."
npm run docker:db:up

# Aguardar o banco estar pronto
print_status "Aguardando PostgreSQL ficar disponível..."
sleep 10

# Verificar se o banco está rodando
until docker exec pitchlab-postgres pg_isready -U pitchlab -d pitchlab_db; do
    print_status "Aguardando PostgreSQL..."
    sleep 2
done

print_success "PostgreSQL está pronto! ✅"

# Gerar cliente Prisma
print_status "Gerando cliente Prisma..."
npm run db:generate

# Executar migrações
print_status "Executando migrações do banco..."
npm run db:migrate

# Executar seed (opcional)
read -p "Deseja executar o seed com dados de exemplo? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Executando seed do banco..."
    npm run db:seed
    print_success "Seed executado com sucesso! ✅"
fi

echo ""
print_success "🎉 Configuração concluída com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Execute 'npm run dev' para iniciar o servidor"
echo "   2. Acesse http://localhost:3001/api/health para verificar se tudo está funcionando"
echo "   3. Use 'npm run docker:db:logs' para ver logs do PostgreSQL"
echo "   4. Use 'npm run docker:db:down' para parar o PostgreSQL"
echo "   5. Use 'npm run db:studio' para abrir o Prisma Studio"
echo ""
echo "🐳 Comandos úteis do Docker:"
echo "   - npm run docker:db:up    # Iniciar PostgreSQL"
echo "   - npm run docker:db:down  # Parar PostgreSQL"
echo "   - npm run docker:db:reset # Resetar dados do PostgreSQL"
echo ""
print_success "Ambiente de desenvolvimento pronto! 🚀"
