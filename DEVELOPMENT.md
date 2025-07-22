# AI Platform Portal Development Setup

## Option 1: Docker Compose (Recommended)

### Prerequisites
- Docker and Docker Compose installed
- Docker Desktop running

### Quick Start
```bash
# Clone and navigate to the project
cd AgentPlatform

# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/docs
```

### Stop the application
```bash
docker-compose down
```

## Option 2: Local Development

### Backend Setup (Python FastAPI)
```bash
# Navigate to backend directory
cd portal-be

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup (React/TypeScript)
```bash
# Open a new terminal and navigate to frontend directory
cd portal-fe

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Demo Credentials

Use these credentials to test the login functionality:

- **Admin User:**
  - Username: `admin`
  - Password: `password`
  - Role: AI Admin (full access)

- **Regular User:**
  - Username: `user`
  - Password: `password`
  - Role: User (limited access)

## Testing the API

You can test the API endpoints using the interactive documentation at http://localhost:8000/docs or with curl:

```bash
# Test status endpoint
curl http://localhost:8000/api/status

# Login and get token
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "password"}'

# Use token to access protected endpoints
curl -X GET http://localhost:8000/api/agents \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
AgentPlatform/
├── portal-fe/               # React/TypeScript frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service functions
│   │   ├── types/          # TypeScript type definitions
│   │   └── contexts/       # React context providers
│   ├── Dockerfile
│   └── package.json
├── portal-be/               # FastAPI Python backend
│   ├── main.py             # Main application file
│   ├── openapi.yaml        # API specification
│   ├── Dockerfile
│   └── requirements.txt
├── docker-compose.yml      # Container orchestration
└── README.md              # This file
```

## Features Implemented

### ✅ Core Infrastructure
- React/TypeScript frontend with Vite
- FastAPI Python backend
- Docker containerization
- CORS configuration
- JWT-based authentication (mock)

### ✅ Authentication & Security
- Login page with form validation
- Protected routes
- Token-based authentication
- Mock RBAC system

### ✅ UI/UX Framework
- Ant Design component library
- Responsive layout with sidebar navigation
- Modern, clean design
- Consistent theming

### ✅ API Endpoints
All major endpoints implemented with full OpenAPI 3.0 specification:
- Authentication (`/api/login`)
- AI Agents CRUD (`/api/agents`)
- MCP Tools CRUD (`/api/mcp-tools`)
- LLMs CRUD (`/api/llms`)
- RAG System configuration (`/api/rag/*`)
- Security & RBAC (`/api/security/*`)
- Metrics & Telemetry (`/api/metrics/*`)

### ✅ Mock Data
- In-memory data stores
- Sample AI agents, MCP tools, and LLMs
- Realistic mock metrics
- RBAC configurations

### ✅ Enhanced Visual Pipeline Builder
- React Flow based drag-and-drop interface
- 11 component types with specialized functionality:
  - LLM Engine, Vector Database, Data Loader
  - **Knowledgebase Retriever** (with configurable search types)
  - Prompt Rewriter, Inject Conversation Context
  - MCP Tool Selector, MCP Tool Orchestrator
  - Memory Store, Response Formatter, API Gateway
- Fixed Start/End nodes (always present, draggable but non-deletable)
- Component configuration modal with dynamic options
- Visual connection system with animated edges
- Node positioning and flow management

### 🚧 To Be Implemented (Next Phase)
- Complete UI screens for all features
- Advanced metrics dashboards
- Real database integration
- Production security
- Advanced RBAC management
- File upload/management
- Real-time notifications

## Troubleshooting

### Docker Issues
If Docker Compose fails:
1. Ensure Docker Desktop is running
2. Check for port conflicts (3000, 8000)
3. Try `docker-compose down` and `docker-compose up --build`

### Local Development Issues
If you encounter module errors:
1. Ensure all dependencies are installed (`npm install`, `pip install -r requirements.txt`)
2. Check Node.js version (requires 18+)
3. Check Python version (requires 3.11+)
4. Verify virtual environment is activated for Python

### Frontend Build Issues
If you encounter TypeScript errors:
1. The errors are expected due to missing dependencies during initial setup
2. Run `npm install` in the portal-fe directory
3. Restart the development server

## Next Steps

1. **Complete UI Implementation**: Build out the detailed pages for each feature
2. **Pipeline Builder**: Implement the visual drag-and-drop interface
3. **Advanced Metrics**: Create comprehensive dashboards with charts
4. **Real Database**: Replace in-memory storage with PostgreSQL/MongoDB
5. **Production Setup**: Add proper JWT, HTTPS, environment configuration
6. **Testing**: Add unit and integration tests
7. **Documentation**: Expand API documentation and user guides
