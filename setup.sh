#!/bin/bash

echo "🚀 Snapchat Automation Platform - Setup Script"
echo "=============================================="
echo ""

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker and run this script again."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo ""

# Setup environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env and update JWT_SECRET and ENCRYPTION_KEY"
else
    echo "ℹ️  .env file already exists"
fi
echo ""

# Start Docker services
echo "🐳 Starting Docker services (PostgreSQL + Redis)..."
docker-compose up -d
echo ""

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5
echo ""

# Run database migrations
echo "🗄️  Running database migrations..."
cd apps/api
pnpm db:migrate
cd ../..
echo ""

# Install Playwright browsers
echo "🎭 Installing Playwright browsers..."
cd apps/worker
pnpm exec playwright install chromium
cd ../..
echo ""

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads
mkdir -p screenshots
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and set JWT_SECRET and ENCRYPTION_KEY"
echo "2. Run 'pnpm dev:api' to start the API server"
echo "3. Run 'pnpm dev:worker' to start the worker"
echo ""
echo "📚 Read README.md for more information"
