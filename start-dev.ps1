# Development startup script for the AI Chat application (PowerShell)

Write-Host "🚀 Starting AI Chat Application Development Environment" -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Creating from example..." -ForegroundColor Yellow
    "GEMINI_API_KEY=your_gemini_api_key_here" | Out-File -FilePath ".env" -Encoding utf8
    Write-Host "Please edit .env file with your actual Gemini API key" -ForegroundColor Red
    exit 1
}

# Check if Docker is running
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

Write-Host "🐳 Starting Docker containers..." -ForegroundColor Blue
docker-compose up -d

Write-Host "⏳ Waiting for services to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "🔍 Checking service health..." -ForegroundColor Blue

# Check Agent API Server
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8001/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Agent API Server is running on http://localhost:8001" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Agent API Server is not responding" -ForegroundColor Red
}

# Check Portal Backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Portal Backend is running on http://localhost:8000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Portal Backend is not responding" -ForegroundColor Red
}

# Check Portal Frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Portal Frontend is running on http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Portal Frontend is not responding" -ForegroundColor Red
}

# Check Sample Agent Client
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Sample Agent Client is running on http://localhost:3001" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Sample Agent Client is not responding" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Application is ready!" -ForegroundColor Green
Write-Host "🏢 Admin Portal: http://localhost:3000" -ForegroundColor Cyan
Write-Host "� Chat UI: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📚 Portal API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "� Agent API Docs: http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host "🔧 Health Checks: http://localhost:8000/health | http://localhost:8001/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "To stop the application, run: docker-compose down" -ForegroundColor Yellow
