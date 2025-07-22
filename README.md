# B2B AI Platform Portal

A modern, simple, and intuitive B2B AI platform portal with React/TypeScript frontend and Python FastAPI backend.

## Project Structure

```
AgentPlatform/
├── portal-fe/         # React/TypeScript application
├── portal-be/         # FastAPI Python application
├── docker-compose.yml # Container orchestration
└── README.md         # This file
```

## Quick Start

1. **Prerequisites**
   - Docker and Docker Compose installed (for containerized setup)
   - Node.js 18+ (for local development)
   - Python 3.11+ (for local development)

2. **Backend Setup (Currently Working)**
   ```bash
   cd portal-be
   pip install fastapi uvicorn python-jose passlib pydantic-settings
   python run.py
   ```

3. **Access the Backend**
   - Backend API: http://localhost:8000
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
