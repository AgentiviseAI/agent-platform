# Agent Platform - Development Startup Script

Write-Host "🚀 Agent Platform - Development Environment" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Step 1: Clone required services
Write-Host "📦 Step 1: Cloning required services..." -ForegroundColor Yellow
& .\clone-services.ps1

# Step 2: Check if Docker is running
Write-Host "🐳 Step 2: Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "   ✅ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# Step 3: Start Docker services
Write-Host "🚀 Step 3: Starting Docker services..." -ForegroundColor Yellow
Write-Host "   This may take a few minutes on first run..." -ForegroundColor Gray

try {
    docker-compose down --remove-orphans 2>$null
    docker-compose up --build -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker services started successfully!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Failed to start Docker services" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Error starting services: $_" -ForegroundColor Red
    exit 1
}

# Step 4: Wait for services to initialize
Write-Host "⏳ Step 4: Waiting for services to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 5: Health checks
Write-Host "🔍 Step 5: Checking service health..." -ForegroundColor Yellow

# Check database
try {
    docker exec ai-platform-db pg_isready -h localhost -p 5432 -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Database is ready" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Database is still starting..." -ForegroundColor Orange
    }
} catch {
    Write-Host "   ⚠️  Database status unknown" -ForegroundColor Orange
}

# Check Control Tower (Backend)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Control Tower (Backend) is running" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Control Tower is still starting..." -ForegroundColor Orange
}

# Check Auth Service
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Auth Service is running" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Auth Service is still starting..." -ForegroundColor Orange
}

# Check Control Plane UX (Frontend)
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Control Plane UX (Frontend) is running" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Control Plane UX is still starting..." -ForegroundColor Orange
}

Write-Host ""
Write-Host "🎉 Agent Platform is ready!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Service URLs:" -ForegroundColor Yellow
Write-Host "   🎯 Control Tower (Backend):  http://localhost:8000" -ForegroundColor Cyan
Write-Host "   🎨 Control Plane UX:         http://localhost:3000" -ForegroundColor Cyan
Write-Host "   🔐 Auth Service:             http://localhost:8001" -ForegroundColor Cyan
Write-Host "   🗄️  PostgreSQL Database:      localhost:5432" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 API Documentation:" -ForegroundColor Yellow
Write-Host "   📖 Control Tower API Docs:  http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "   🔑 Auth Service API Docs:   http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "🛠️  Management Commands:" -ForegroundColor Yellow
Write-Host "   📝 View logs:        docker-compose logs -f" -ForegroundColor Gray
Write-Host "   📊 Check status:     docker-compose ps" -ForegroundColor Gray
Write-Host "   🛑 Stop services:    docker-compose down" -ForegroundColor Gray
Write-Host "   🔄 Restart service:  docker-compose restart <service_name>" -ForegroundColor Gray
Write-Host ""
