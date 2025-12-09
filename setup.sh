#!/bin/bash

set -e

echo "🚀 Snapchat Automation - Automated Setup"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}📦 pnpm not found. Installing pnpm...${NC}"
    npm install -g pnpm
    echo -e "${GREEN}✅ pnpm installed successfully${NC}"
else
    echo -e "${GREEN}✅ pnpm is already installed${NC}"
fi

# Check if docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker not found. Please install Docker Desktop:${NC}"
    echo "   👉 https://www.docker.com/products/docker-desktop"
    echo ""
    echo "   After installing Docker, run this script again."
    exit 1
else
    echo -e "${GREEN}✅ Docker is installed${NC}"
fi

# Check if Docker daemon is running
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon is not running. Please start Docker Desktop.${NC}"
    exit 1
fi

# Setup environment files
echo ""
echo "📝 Setting up environment files..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Remember to update .env with your settings!${NC}"
else
    echo -e "${YELLOW}⚠️  .env already exists, skipping...${NC}"
fi

# Start Docker containers
echo ""
echo "🐳 Starting Docker containers (PostgreSQL & Redis)..."
docker-compose up -d

echo ""
echo "⏳ Waiting for database to be ready..."
sleep 5

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
pnpm --filter @snapchat-automation/api db:generate

# Run database migrations
echo ""
echo "🗄️  Running database migrations..."
pnpm db:migrate

# Install Playwright browsers
echo ""
echo "🎭 Installing Playwright browsers..."
cd apps/worker
pnpm exec playwright install chromium
cd ../..

# Create uploads directory
echo ""
echo "📁 Creating required directories..."
mkdir -p uploads
mkdir -p screenshots

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "🎯 Next steps:"
echo "   1. Review and update .env file with your settings"
echo "   2. Start the application:"
echo ""
echo "      # Run all services:"
echo "      pnpm dev"
echo ""
echo "      # Or run individually:"
echo "      pnpm dev:api     # API server on http://localhost:3000"
echo "      pnpm dev:worker  # Background worker"
echo "      pnpm dev:web     # Web interface"
echo ""
echo "   3. Access Prisma Studio: pnpm db:studio"
echo ""
echo "📚 Useful commands:"
echo "   pnpm docker:logs   # View Docker logs"
echo "   pnpm docker:down   # Stop Docker containers"
echo ""
