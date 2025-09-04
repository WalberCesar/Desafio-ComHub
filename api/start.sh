#!/bin/bash

# PitchLab API - Start Script
# Este script carrega o nvm e inicia o servidor

echo "🚀 Iniciando PitchLab API..."

# Carregar nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verificar se o Node.js está disponível
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instalando via nvm..."
    nvm install node
fi

echo "📝 Node.js version: $(node --version)"
echo "📦 npm version: $(npm --version)"

# Instalar dependências se necessário
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
fi

# Iniciar servidor
echo "🎯 Iniciando servidor em modo desenvolvimento..."
echo "🌐 API estará disponível em: http://localhost:3001"
echo "❤️  Health check: http://localhost:3001/api/health"
echo ""
echo "Para parar o servidor, pressione Ctrl+C"
echo ""

npx ts-node src/index.ts




