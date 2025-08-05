# Agent Platform - Database Infrastructure

This repository provides the shared database infrastructure for the Agent Platform ecosystem.

## 🏗️ Architecture Overview

The Agent Platform has been split into separate repositories for better maintainability and deployment:

### 📦 **Separated Repositories**
- **Control Plane UX (Frontend)** → `ControlPlaneUX` repository
- **Control Tower (Backend)** → `ControlTower` repository  
- **Agent Plane (API Server)** → `AgentPlane` repository
- **Sample ChatBot** → `SampleChatBot` repository

### � **Service Architecture** (This Repository)
- **PostgreSQL 15** database for shared data
- **Control Tower** - Backend API service (Port 8000)
- **Control Plane UX** - Frontend React application (Port 3000)
- **Auth Service** - Authentication and authorization (Port 8001)
- **Centralized database** for all platform components
- **Docker Compose** configuration for local development
- **Network configuration** for service communication

### 🗄️ **Additional Components**
- **Tailwind CSS** for beautiful, responsive styling
- **Real-time chat interface** similar to ChatGPT
- **File attachments** and voice recording support
- **Session management** with conversation history

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed
- **PowerShell** (for Windows users)

### 1. Automated Setup (Recommended)

```powershell
# Clone this repository and navigate to it
git clone <repository-url>
cd AgentPlatform

# Run the automated setup script
.\start-dev.ps1
```

The script will:
1. 📦 Clone required service repositories (ControlTower, ControlPlaneUX, AuthService)
2. 🐳 Start all Docker services
3. 🔍 Perform health checks
4. 🎉 Display service URLs

### 2. Manual Setup

If you prefer manual setup:

```powershell
# Clone required service repositories
.\clone-services.ps1

# Start all services
docker-compose up --build -d

# Check service status
docker-compose ps
```

**Note**: Make sure you have:
- Git installed and configured
- Access to the AgentiviseAI repositories
- Proper authentication credentials set up

### 3. Access Services

Once started, access the services at:
- **Control Tower (Backend)**: http://localhost:8000
- **Control Plane UX (Frontend)**: http://localhost:3000  
- **Auth Service**: http://localhost:8001
- **PostgreSQL Database**: localhost:5432

## 🛠️ Development Commands

```powershell
# View service logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f controltower
docker-compose logs -f controlplaneux
docker-compose logs -f authservice

# Check service status
docker-compose ps

# Restart specific service
docker-compose restart controltower

# Stop all services
docker-compose down

# Rebuild and restart all services
docker-compose up --build -d

# Remove all containers and volumes (clean slate)
docker-compose down --volumes --remove-orphans
```

## 🔧 Service Configuration

### Environment Variables

Each service can be configured via environment variables in the `docker-compose.yml`:

**Control Tower (Backend)**:
- `DATABASE_URL`: PostgreSQL connection string
- `HOST`: Server host (default: 0.0.0.0)
- `PORT`: Server port (default: 8000)
- `ENVIRONMENT`: Runtime environment (development/production)

**Auth Service**:
- `DATABASE_URL`: SQLite database path
- `API_HOST`: Server host
- `API_PORT`: Server port (mapped to 8001 externally)

**Control Plane UX (Frontend)**:
- `VITE_API_BASE_URL`: Backend API URL
- `VITE_ENVIRONMENT`: Build environment

Each separated service repository can connect to this shared database using the connection string above.

## 🛠️ Database Management

### Start Database Only

```bash
# Start the database service
docker-compose up db -d

# View database logs
docker-compose logs -f db

# Stop database
docker-compose down
```

### Database Connection from Services

```bash
# Use this connection string in your separated services:
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_platform

# For async connections (SQLAlchemy with asyncpg):
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/ai_platform
```

### Option 2: Local Development

## 📁 Repository Structure

```
AgentPlatform/
├── docker-compose.yml         # Database infrastructure
├── README.md                  # This file
├── .env.example               # Environment template
├── .gitignore                 # Git ignore rules
└── start-dev.ps1             # Development startup script
```

## 🔗 Related Repositories

The Agent Platform ecosystem consists of these repositories:

### Frontend Applications
- **`ControlPlaneUX`** - Primary control plane user interface (React/TypeScript)
- **`SampleChatBot`** - Sample conversational AI chatbot (React/TypeScript)

### Backend Services  
- **`ControlTower`** - Main platform backend (FastAPI/Python)
- **`AgentPlane`** - Agent API server (FastAPI/Python)

### Infrastructure
- **`AgentPlatform`** - Shared database infrastructure (This repository)

Each repository includes:
- ✅ GitHub Actions for Azure App Service deployment
- ✅ Docker configuration
- ✅ Comprehensive documentation
- ✅ Environment configuration

## 🚀 Deployment Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ ControlPlaneUX  │    │  SampleChatBot  │    │                 │
│   (Frontend)    │    │   (ChatBot)     │    │   ControlTower  │
│                 │    │                 │    │   (Backend)     │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────┐
                    │    AgentPlane       │
                    │  (Agent Server)     │
                    └─────────┬───────────┘
                              │
                    ┌─────────┴───────────┐
                    │   PostgreSQL DB     │
                    │ (This Repository)   │
                    └─────────────────────┘
```
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API services
│   │   └── types/             # TypeScript types
│   └── package.json
├── agent-api-server/          # Chat processing backend
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   ├── core/              # Database, logging, metrics
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Request/response schemas
│   │   ├── services/          # Business logic services
│   │   └── workflow/          # Processing workflow nodes
│   └── main.py
├── sample-agent-client/       # Chat interface frontend
│   ├── src/
## 🛠️ Development & Deployment

### Local Development
1. Start the database infrastructure: `docker-compose up -d`
2. Clone and set up each service repository separately
3. Configure each service to connect to `localhost:5432`

### Production Deployment
Each service repository includes GitHub Actions workflows for automatic deployment to Azure App Service.

### Environment Variables
Create a `.env` file based on `.env.example`:

```bash
# Database configuration
POSTGRES_DB=ai_platform
POSTGRES_USER=postgres  
POSTGRES_PASSWORD=your_secure_password

# Network configuration
COMPOSE_PROJECT_NAME=agent_platform
```

## � Migration Notes

This repository previously contained all services in a monolithic structure. The services have been extracted to separate repositories while preserving their git history:

- **Extraction Method**: Used `git filter-branch --subdirectory-filter` 
- **History Preservation**: ✅ Complete commit history maintained
- **Database**: Remains centralized for data consistency
- **Deployment**: Each service now deploys independently
- **Renamed**: portal-fe → ControlPlaneUX, sample-agent-client → SampleChatBot for better clarity

## 🤝 Contributing

1. Database schema changes should be made in service repositories
2. Infrastructure updates (Docker, networking) go in this repository  
3. Each service repository has its own contribution guidelines

## 📄 License

This project is licensed under the MIT License.

The agent-api-server has been refactored with:
- **✅ Service Layer Separation**: AgentService, WorkflowService, ConversationService
- **✅ Clean Architecture**: Organized into core/, models/, schemas/, services/, api/
- **✅ Enhanced Observability**: Comprehensive logging and metrics
- **✅ Type Safety**: Full TypeScript/Python type annotations
- **✅ Error Handling**: Robust error handling throughout

## 🛡️ Environment Variables
---

**Built with ❤️ for the Agent Platform Ecosystem**
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

## Features

- **AI Agents Management**: Create, configure, and manage AI agents
- **MCP Tools**: Manage Model Context Protocol tools with RBAC
- **LLM Management**: Configure and manage Large Language Models
- **Knowledgebase**: Configure connectors and metrics for Retrieval-Augmented Generation
- **Workflow Builder**: Visual drag-and-drop workflow creation
- **Security & RBAC**: Role-based access control management
- **Telemetry & Metrics**: Comprehensive monitoring dashboard

## API Documentation

The complete OpenAPI 3.0 specification is available at `/docs` when running the backend, or in `portal-be/openapi.yaml`.

## Architecture

- **Frontend**: React 18 + TypeScript + Vite + Ant Design
- **Backend**: FastAPI + Python 3.11
- **State Management**: React Context API + useReducer
- **Styling**: Ant Design components with custom CSS
- **API Communication**: Axios for HTTP requests
- **Containerization**: Docker with multi-stage builds
