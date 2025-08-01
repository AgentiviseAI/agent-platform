# Agent Platform - Database Infrastructure

This repository provides the shared database infrastructure for the Agent Platform ecosystem.

## 🏗️ Architecture Overview

The Agent Platform has been split into separate repositories for better maintainability and deployment:

### 📦 **Separated Repositories**
- **Portal Frontend** → `portal-fe` repository
- **Control Tower (Backend)** → `ControlTower` repository  
- **Agent Plane (API Server)** → `AgentPlane` repository
- **Sample Agent Client** → `sample-agent-client` repository

### 🗄️ **Database Infrastructure** (This Repository)
- **PostgreSQL 15** database for shared data
- **Centralized database** for all platform components
- **Docker Compose** configuration for local development
- **Network configuration** for service communication
- **Tailwind CSS** for beautiful, responsive styling
- **Real-time chat interface** similar to ChatGPT
- **File attachments** and voice recording support
- **Session management** with conversation history

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed

### 1. Start Database Infrastructure

```bash
# Start the PostgreSQL database
docker-compose up -d

# Or with build (if needed)
docker-compose up --build -d
```

### 2. Access Database

- **Database**: `postgresql://postgres:password@localhost:5432/ai_platform`
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `ai_platform`
- **Username**: `postgres`
- **Password**: `password`

### 3. Connect Other Services

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
- **`portal-fe`** - Admin portal frontend (React/TypeScript)
- **`sample-agent-client`** - Sample chat client (React/TypeScript)

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
│   portal-fe     │    │ sample-agent-   │    │                 │
│   (Frontend)    │    │   client        │    │   ControlTower  │
│                 │    │  (Frontend)     │    │   (Backend)     │
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
