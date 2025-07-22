# AI Platform - Complete AI Chat Application

A modern, full-stack AI chat application featuring a React frontend and FastAPI backend with real-time conversations powered by Google Gemini 1.5 Flash.

## 🏗️ Architecture Overview

This application consists of four main components:

### 🔧 **Portal Backend** (`portal-be/`)
- **FastAPI** application for managing AI platform resources
- **PostgreSQL** database with comprehensive schemas
- **RESTful APIs** for agents, LLMs, pipelines, RAG connectors
- **Security and user management**
- **Metrics and monitoring**

### 🎨 **Portal Frontend** (`portal-fe/`)
- **React + TypeScript** modern web application
- **Responsive design** with modern UI components
- **Admin interface** for managing platform resources
- **Dashboard and analytics**

### 🤖 **Agent API Server** (`agent-api-server/`)
- **FastAPI** application following SOLID principles
- **Pipeline-based processing** with pluggable nodes
- **Google Gemini 1.5 Flash** integration
- **Conversation history** and caching
- **Clean architecture** with service layer separation

### 💬 **Sample Agent Client** (`sample-agent-client/`)
- **React + TypeScript** chat interface
- **Tailwind CSS** for beautiful, responsive styling
- **Real-time chat interface** similar to ChatGPT
- **File attachments** and voice recording support
- **Session management** with conversation history

## 🚀 Quick Start

### Prerequisites
- **Docker** and **Docker Compose** installed
- **Google Gemini API key**

### 1. Environment Setup

```bash
# Clone the repository
cd AgentPlatform

# Create environment file
echo "GEMINI_API_KEY=your_actual_gemini_api_key_here" > .env
```

### 2. Start Application (Windows)

```powershell
# Using the PowerShell script (Windows)
.\start-dev.ps1
```

### 3. Manual Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in background
docker-compose up -d
```

### 4. Access the Applications

- **💬 Chat Interface**: http://localhost:3001
- **🔧 Admin Portal**: http://localhost:3000  
- **📚 Agent API Docs**: http://localhost:8001/docs
- **🏢 Portal API Docs**: http://localhost:8000/docs
- **🔍 Health Checks**: 
  - Agent API: http://localhost:8001/health
  - Portal API: http://localhost:8000/health

## 🛠️ Development Setup

### Option 1: Docker Compose (Recommended)

```bash
# Start all services with hot reload
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Local Development

#### Backend Services
```bash
# Portal Backend
cd portal-be
pip install -r requirements.txt
python main.py

# Agent API Server  
cd agent-api-server
pip install -r requirements.txt
python app/main.py
```

#### Frontend Services
```bash
# Portal Frontend
cd portal-fe
npm install
npm run dev

# Sample Agent Client
cd sample-agent-client
npm install
npm run dev
```

## 📁 Project Structure

```
AgentPlatform/
├── portal-be/                 # Main platform backend
│   ├── app/
│   │   ├── api/v1/            # API endpoints
│   │   ├── core/              # Core infrastructure
│   │   ├── models/            # Database models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── repositories/      # Data access layer
│   └── main.py
├── portal-fe/                 # Admin portal frontend
│   ├── src/
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
│   │   └── pipeline/          # Processing pipeline nodes
│   └── main.py
├── sample-agent-client/       # Chat interface frontend
│   ├── src/
│   │   ├── components/        # Chat UI components
│   │   ├── services/          # API client
│   │   └── types/             # TypeScript interfaces
│   └── package.json
├── docker-compose.yml         # Container orchestration
└── start-dev.ps1             # Development startup script
```

## 🔧 Key Features

### Backend Capabilities
- **🔄 Pipeline Processing**: Modular, configurable processing chains
- **💾 Data Persistence**: PostgreSQL with proper relationships
- **⚡ Caching**: In-memory caching for performance
- **📊 Monitoring**: Comprehensive logging and metrics
- **🔒 Security**: Authentication and authorization
- **🏗️ Clean Architecture**: Service layer separation, SOLID principles

### Frontend Features
- **💬 Real-time Chat**: ChatGPT-like conversation interface
- **📎 File Attachments**: Support for document uploads
- **🎤 Voice Input**: Voice recording capability
- **📱 Responsive Design**: Works on desktop and mobile
- **⚙️ Admin Interface**: Manage agents, LLMs, and pipelines
- **📈 Analytics**: Usage metrics and performance monitoring

## 🐳 Docker Services

| Service | Port | Description |
|---------|------|-------------|
| `db` | 5432 | PostgreSQL database |
| `portal-be` | 8000 | Main platform API |
| `portal-fe` | 3000 | Admin portal UI |
| `agent-api-server` | 8001 | Chat processing API |
| `sample-agent-client` | 3001 | Chat interface UI |

## 📚 API Documentation

### Agent API Server Endpoints
- `POST /process_prompt` - Process chat messages
- `GET /health` - Service health check
- `GET /metrics` - Performance metrics

### Portal Backend Endpoints
- `/api/v1/agents/` - Agent management
- `/api/v1/llms/` - LLM configuration
- `/api/v1/pipelines/` - Pipeline management
- `/api/v1/rag/` - RAG connector management
- `/api/v1/security/` - User and role management

## 🔄 Recent Refactoring

The agent-api-server has been refactored with:
- **✅ Service Layer Separation**: AgentService, PipelineService, ConversationService
- **✅ Clean Architecture**: Organized into core/, models/, schemas/, services/, api/
- **✅ Enhanced Observability**: Comprehensive logging and metrics
- **✅ Type Safety**: Full TypeScript/Python type annotations
- **✅ Error Handling**: Robust error handling throughout

## 🛡️ Environment Variables

```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional (with defaults)
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_platform
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 🚪 Stopping the Application

```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🎯 Next Steps

1. **🔑 Set up your Gemini API key** in the `.env` file
2. **🚀 Run the startup script**: `.\start-dev.ps1`
3. **💬 Start chatting** at http://localhost:3001
4. **⚙️ Explore the admin portal** at http://localhost:3000

---

**Built with ❤️ using FastAPI, React, PostgreSQL, and Google Gemini AI**
   - API Documentation: http://localhost:8000/docs

4. **Frontend Setup (Next Steps)**
   ```bash
   cd portal-fe
   npm install
   npm run dev
   ```

## Development Setup

### Frontend (React/TypeScript)
```bash
cd portal-fe
npm install
npm run dev
```

### Backend (FastAPI)
```bash
cd portal-be
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 5000
```

## Features

- **AI Agents Management**: Create, configure, and manage AI agents
- **MCP Tools**: Manage Model Context Protocol tools with RBAC
- **LLM Management**: Configure and manage Large Language Models
- **RAG System**: Configure connectors and metrics for Retrieval-Augmented Generation
- **Pipeline Builder**: Visual drag-and-drop pipeline creation
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
