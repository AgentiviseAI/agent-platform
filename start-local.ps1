# Agent Platform - Local Development Script (Daemon Mode)
# Starts all services as background processes and exits

param(
    [switch]$Stop,
    [switch]$Status,
    [switch]$Logs,
    [string]$Service = ""
)

Write-Host "🚀 Agent Platform - Local Development (Daemon Mode)" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$services = @{
    ControlTower = @{
        path = "../ControlTower"
        command = "-m uvicorn main:app --host 0.0.0.0 --port 8000"
        port = 8000
        name = "Control Tower (Backend)"
    }
    AuthService = @{
        path = "../AuthService"
        command = "-m uvicorn app.main:app --host 0.0.0.0 --port 8001"
        port = 8001
        name = "Auth Service"
    }
    AgentPlane = @{
        path = "../AgentPlane"
        command = "-m uvicorn app.main:app --host 0.0.0.0 --port 8002"
        port = 8002
        name = "Agent Plane (Backend)"
    }
    ControlPlaneUX = @{
        path = "../ControlPlaneUX"
        command = "run dev"
        port = 3000
        name = "Control Plane UX (Frontend)"
    }
}

# Function to check if a port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("127.0.0.1", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to find process by port
function Get-ProcessByPort {
    param([int]$Port)
    try {
        $netstat = netstat -ano | Select-String ":$Port "
        if ($netstat) {
            $processId = ($netstat -split '\s+')[-1]
            return Get-Process -Id $processId -ErrorAction SilentlyContinue
        }
    } catch {}
    return $null
}

# Function to stop all services
function Stop-AllServices {
    Write-Host "🛑 Stopping all services..." -ForegroundColor Yellow
    
    # Stop Python services
    Write-Host "   Stopping Python services..." -ForegroundColor Gray
    Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Stop Node services
    Write-Host "   Stopping Node.js services..." -ForegroundColor Gray
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    
    # Stop specific ports if still occupied
    foreach ($serviceName in $services.Keys) {
        $service = $services[$serviceName]
        $port = $service.port
        
        if (Test-Port -Port $port) {
            $process = Get-ProcessByPort -Port $port
            if ($process) {
                Write-Host "   Stopping process on port $port..." -ForegroundColor Gray
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
        }
    }
    
    Write-Host "   ✅ All services stopped" -ForegroundColor Green
}

# Function to show service status
function Show-Status {
    Write-Host "📊 Service Status:" -ForegroundColor Yellow
    foreach ($serviceName in $services.Keys) {
        $service = $services[$serviceName]
        $port = $service.port
        $isRunning = Test-Port -Port $port
        
        if ($isRunning) {
            Write-Host "   ✅ $($service.name) - Running (Port $port)" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $($service.name) - Not running (Port $port)" -ForegroundColor Red
        }
    }
}

# Function to show logs
function Show-Logs {
    param([string]$ServiceName)
    
    if (!(Test-Path "logs")) {
        Write-Host "❌ Logs directory not found. Start services first." -ForegroundColor Red
        return
    }
    
    if ($ServiceName) {
        $logFile = "logs\$ServiceName.log"
        if (Test-Path $logFile) {
            Write-Host "📝 Showing logs for $ServiceName (Press Ctrl+C to exit)..." -ForegroundColor Yellow
            Get-Content $logFile -Wait
        } else {
            Write-Host "❌ Log file not found: $logFile" -ForegroundColor Red
            Show-AvailableLogs
        }
    } else {
        Show-AvailableLogs
    }
}

function Show-AvailableLogs {
    Write-Host "📝 Available service logs:" -ForegroundColor Yellow
    $logFiles = Get-ChildItem "logs\*.log" -ErrorAction SilentlyContinue
    if ($logFiles) {
        foreach ($logFile in $logFiles) {
            Write-Host "   $($logFile.BaseName)" -ForegroundColor Cyan
        }
        Write-Host ""
        Write-Host "Usage: .\start-local.ps1 -Logs -Service <ServiceName>" -ForegroundColor Gray
    } else {
        Write-Host "   No log files found. Start services first." -ForegroundColor Gray
    }
}

# Handle command line arguments
if ($Stop) {
    Stop-AllServices
    exit 0
}

if ($Status) {
    Show-Status
    exit 0
}

if ($Logs) {
    Show-Logs -ServiceName $Service
    exit 0
}

# Main script execution
Write-Host ""
Write-Host "Step 1: Stopping existing services..." -ForegroundColor Yellow
Stop-AllServices

Write-Host ""
Write-Host "Step 2: Creating logs directory..." -ForegroundColor Yellow
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" | Out-Null
    Write-Host "   ✅ Created logs directory" -ForegroundColor Green
} else {
    Write-Host "   ✅ Logs directory exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Step 3: Starting services in background..." -ForegroundColor Yellow

$startedServices = 0

# Start ControlTower
$controlTowerPath = Join-Path (Get-Location) $services.ControlTower.path
if (Test-Path $controlTowerPath) {
    Write-Host "   Starting Control Tower..." -ForegroundColor Cyan
    $logFile = "logs\ControlTower.log"
    $errorFile = "logs\ControlTower.error.log"
    $env:ENVIRONMENT = "dev"
    
    try {
        Start-Process -FilePath "python" -ArgumentList $services.ControlTower.command `
            -WorkingDirectory $controlTowerPath `
            -RedirectStandardOutput $logFile `
            -RedirectStandardError $errorFile `
            -WindowStyle Hidden
        Write-Host "   ✅ Control Tower started" -ForegroundColor Green
        $startedServices++
    } catch {
        Write-Host "   ❌ Failed to start Control Tower: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  Control Tower directory not found: $controlTowerPath" -ForegroundColor Yellow
}

# Start AuthService
$authServicePath = Join-Path (Get-Location) $services.AuthService.path
if (Test-Path $authServicePath) {
    Write-Host "   Starting Auth Service..." -ForegroundColor Cyan
    $logFile = "logs\AuthService.log"
    $errorFile = "logs\AuthService.error.log"
    $env:ENVIRONMENT = "dev"
    
    try {
        Start-Process -FilePath "python" -ArgumentList $services.AuthService.command `
            -WorkingDirectory $authServicePath `
            -RedirectStandardOutput $logFile `
            -RedirectStandardError $errorFile `
            -WindowStyle Hidden
        Write-Host "   ✅ Auth Service started" -ForegroundColor Green
        $startedServices++
    } catch {
        Write-Host "   ❌ Failed to start Auth Service: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  Auth Service directory not found: $authServicePath" -ForegroundColor Yellow
}

# Start AgentPlane
$agentPlanePath = Join-Path (Get-Location) $services.AgentPlane.path
if (Test-Path $agentPlanePath) {
    Write-Host "   Starting Agent Plane..." -ForegroundColor Cyan
    $logFile = "logs\AgentPlane.log"
    $errorFile = "logs\AgentPlane.error.log"
    $env:ENVIRONMENT = "dev"
    
    try {
        Start-Process -FilePath "python" -ArgumentList $services.AgentPlane.command `
            -WorkingDirectory $agentPlanePath `
            -RedirectStandardOutput $logFile `
            -RedirectStandardError $errorFile `
            -WindowStyle Hidden
        Write-Host "   ✅ Agent Plane started" -ForegroundColor Green
        $startedServices++
    } catch {
        Write-Host "   ❌ Failed to start Agent Plane: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  Agent Plane directory not found: $agentPlanePath" -ForegroundColor Yellow
}

# Start Node.js service
$controlPlaneUXPath = $services["ControlPlaneUX"].path
$absoluteControlPlaneUXPath = Join-Path (Get-Location) $controlPlaneUXPath

if (Test-Path $absoluteControlPlaneUXPath) {
    Write-Host "   Starting Control Plane UX..." -ForegroundColor Cyan
    
    $logFile = "logs\ControlPlaneUX.log"
    $errorFile = "logs\ControlPlaneUX.error.log"
    
    try {
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm $($services["ControlPlaneUX"].command)" `
            -WorkingDirectory $absoluteControlPlaneUXPath `
            -RedirectStandardOutput $logFile `
            -RedirectStandardError $errorFile `
            -WindowStyle Hidden
        
        Write-Host "   ✅ Control Plane UX started" -ForegroundColor Green
        $startedServices++
    } catch {
        Write-Host "   ❌ Failed to start Control Plane UX: $_" -ForegroundColor Red
    }
} else {
    Write-Host "   ⚠️  Control Plane UX directory not found: $absoluteControlPlaneUXPath" -ForegroundColor Yellow
}

# Wait a moment for services to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🎉 Started $startedServices services in background!" -ForegroundColor Green
Write-Host ""

# Show management commands
Write-Host "📋 Management Commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   📊 Check Status:" -ForegroundColor Cyan
Write-Host "      .\start-local.ps1 -Status" -ForegroundColor White
Write-Host ""
Write-Host "   📝 View Logs:" -ForegroundColor Cyan
Write-Host "      .\start-local.ps1 -Logs                    # List available logs" -ForegroundColor White
Write-Host "      .\start-local.ps1 -Logs -Service ControlTower  # View specific service" -ForegroundColor White
Write-Host "      .\start-local.ps1 -Logs -Service AuthService" -ForegroundColor White
Write-Host "      .\start-local.ps1 -Logs -Service AgentPlane" -ForegroundColor White
Write-Host "      .\start-local.ps1 -Logs -Service ControlPlaneUX" -ForegroundColor White
Write-Host ""
Write-Host "   🛑 Stop All Services:" -ForegroundColor Red
Write-Host "      .\start-local.ps1 -Stop" -ForegroundColor White -BackgroundColor Red
Write-Host ""

# Show service URLs
Write-Host "🌐 Service URLs (available once started):" -ForegroundColor Yellow
Write-Host "   Control Tower:   http://localhost:8000 (API: /docs)" -ForegroundColor Cyan
Write-Host "   Auth Service:    http://localhost:8001 (API: /docs)" -ForegroundColor Cyan
Write-Host "   Agent Plane:     http://localhost:8002 (API: /docs)" -ForegroundColor Cyan
Write-Host "   Control Plane:   http://localhost:3000" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ Services are starting in background. Use the commands above to manage them." -ForegroundColor Green
