# Snapchat Automation - Windows Setup Script

Write-Host "🚀 Snapchat Automation - Automated Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Check if pnpm is installed
try {
    $pnpmVersion = pnpm --version 2>$null
    Write-Host "✅ pnpm is already installed (v$pnpmVersion)" -ForegroundColor Green
} catch {
    Write-Host "📦 pnpm not found. Installing pnpm..." -ForegroundColor Yellow
    npm install -g pnpm
    Write-Host "✅ pnpm installed successfully" -ForegroundColor Green
}

# Check if docker is installed
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found. Please install Docker Desktop:" -ForegroundColor Red
    Write-Host "   👉 https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   After installing Docker, run this script again." -ForegroundColor Yellow
    exit 1
}

# Check if Docker daemon is running
try {
    docker info 2>$null | Out-Null
} catch {
    Write-Host "❌ Docker daemon is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# Setup environment files
Write-Host ""
Write-Host "📝 Setting up environment files..." -ForegroundColor Cyan
if (-not (Test-Path .env)) {
    Copy-Item .env.example .env
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host "⚠️  Remember to update .env with your settings!" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  .env already exists, skipping..." -ForegroundColor Yellow
}

# Start Docker containers
Write-Host ""
Write-Host "🐳 Starting Docker containers (PostgreSQL & Redis)..." -ForegroundColor Cyan
docker-compose up -d

Write-Host ""
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
pnpm install

# Generate Prisma client
Write-Host ""
Write-Host "🔧 Generating Prisma client..." -ForegroundColor Cyan
pnpm --filter "@snapchat-automation/api" db:generate

# Run database migrations
Write-Host ""
Write-Host "🗄️  Running database migrations..." -ForegroundColor Cyan
pnpm db:migrate

# Install Playwright browsers
Write-Host ""
Write-Host "🎭 Installing Playwright browsers..." -ForegroundColor Cyan
Set-Location apps/worker
pnpm exec playwright install chromium
Set-Location ../..

# Create required directories
Write-Host ""
Write-Host "📁 Creating required directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path uploads | Out-Null
New-Item -ItemType Directory -Force -Path screenshots | Out-Null

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Review and update .env file with your settings"
Write-Host "   2. Start the application:"
Write-Host ""
Write-Host "      # Run all services:" -ForegroundColor Gray
Write-Host "      pnpm dev" -ForegroundColor White
Write-Host ""
Write-Host "      # Or run individually:" -ForegroundColor Gray
Write-Host "      pnpm dev:api     # API server on http://localhost:3000" -ForegroundColor White
Write-Host "      pnpm dev:worker  # Background worker" -ForegroundColor White
Write-Host "      pnpm dev:web     # Web interface" -ForegroundColor White
Write-Host ""
Write-Host "   3. Access Prisma Studio: pnpm db:studio"
Write-Host ""
Write-Host "📚 Useful commands:" -ForegroundColor Cyan
Write-Host "   pnpm docker:logs   # View Docker logs"
Write-Host "   pnpm docker:down   # Stop Docker containers"
Write-Host ""
