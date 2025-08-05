#!/usr/bin/env pwsh

# Agent Platform - Service Cloning Script
# This script clones the required service repositories for local development

Write-Host "🚀 Agent Platform Service Cloner" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Define the services to clone with their repository URLs
$services = @(
    @{
        Name = "ControlTower"
        Description = "Backend API Service"
        RepoUrl = "git@github.com:AgentiviseAI/ControlTower.git"
    },
    @{
        Name = "ControlPlaneUX" 
        Description = "Frontend UX Service"
        RepoUrl = "git@github.com:AgentiviseAI/ControlPlaneUX.git"
    },
    @{
        Name = "AuthService"
        Description = "Authentication Service"
        RepoUrl = "git@github.com:AgentiviseAI/AuthService.git"
    }
)

# Get the current working directory (should be AgentPlatform)
$currentDir = Get-Location

Write-Host "📁 Working directory: $currentDir" -ForegroundColor Green
Write-Host ""

# Check if git is available
try {
    git --version | Out-Null
    Write-Host "✅ Git is available" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Git and try again" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Function to clone a service repository
function Clone-ServiceRepository {
    param(
        [string]$ServiceName,
        [string]$Description,
        [string]$RepoUrl
    )
    
    $targetPath = Join-Path $currentDir $ServiceName
    
    Write-Host "📦 Cloning $ServiceName ($Description)" -ForegroundColor Yellow
    Write-Host "   🔗 Repository: $RepoUrl" -ForegroundColor Gray
    
    if (Test-Path $targetPath) {
        Write-Host "   ⚠️  $ServiceName already exists, removing..." -ForegroundColor Orange
        Remove-Item $targetPath -Recurse -Force
    }
    
    try {
        Write-Host "   📋 Cloning repository..." -ForegroundColor Gray
        git clone $RepoUrl $targetPath --quiet
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ $ServiceName cloned successfully!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Failed to clone $ServiceName" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Error cloning ${ServiceName}: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Clone each service repository
foreach ($service in $services) {
    Clone-ServiceRepository -ServiceName $service.Name -Description $service.Description -RepoUrl $service.RepoUrl
}

Write-Host "🎉 Repository cloning completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Run: docker-compose up --build -d" -ForegroundColor Gray
Write-Host "   2. Check service logs: docker-compose logs" -ForegroundColor Gray
Write-Host "   3. Access services via their respective ports" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Note: Make sure you have access to the AgentiviseAI repositories" -ForegroundColor Yellow
Write-Host "   If you get authentication errors, check your Git credentials" -ForegroundColor Gray
Write-Host ""
