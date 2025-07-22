import axios, { AxiosResponse } from 'axios';
import { 
  LoginRequest, 
  LoginResponse, 
  AIAgent, 
  CreateAgentRequest,
  MCPTool,
  CreateMCPToolRequest,
  MCPToolRBAC,
  LLM,
  CreateLLMRequest,
  LLMModel,
  RAGConnector,
  RAGMetricsConfig,
  Pipeline,
  PipelineComponentType,
  Role,
  RolePermissions,
  ResourceAccess,
  AgentPerformance,
  PlatformComponentStatus,
  UserEngagement,
  UserSentiment,
  ResourceMetrics,
  ServiceMetrics,
  LLMMetrics,
  RAGMetrics,
  ListResponse
} from '../types';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Generic API helpers
const handleResponse = <T>(response: AxiosResponse<T>): T => response.data;

// Authentication API
export const authAPI = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post('/login', data).then(handleResponse),
  
  status: (): Promise<{ status: string }> =>
    api.get('/status').then(handleResponse),
};

// AI Agents API
export const agentsAPI = {
  list: (): Promise<ListResponse<AIAgent>> =>
    api.get('/agents').then(handleResponse),
  
  get: (id: string): Promise<AIAgent> =>
    api.get(`/agents/${id}`).then(handleResponse),
  
  create: (data: CreateAgentRequest): Promise<AIAgent> =>
    api.post('/agents', data).then(handleResponse),
  
  update: (id: string, data: Partial<CreateAgentRequest>): Promise<AIAgent> =>
    api.put(`/agents/${id}`, data).then(handleResponse),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/agents/${id}`).then(handleResponse),
  
  getPipeline: (agentId: string): Promise<Pipeline> =>
    api.get(`/agents/${agentId}/pipeline`).then(handleResponse),
  
  updatePipeline: (agentId: string, pipeline: Pipeline): Promise<Pipeline> =>
    api.put(`/agents/${agentId}/pipeline`, pipeline).then(handleResponse),
};

// MCP Tools API
export const mcpToolsAPI = {
  list: (): Promise<ListResponse<MCPTool>> =>
    api.get('/mcp-tools').then(handleResponse),
  
  get: (id: string): Promise<MCPTool> =>
    api.get(`/mcp-tools/${id}`).then(handleResponse),
  
  create: (data: CreateMCPToolRequest): Promise<MCPTool> =>
    api.post('/mcp-tools', data).then(handleResponse),
  
  update: (id: string, data: Partial<CreateMCPToolRequest>): Promise<MCPTool> =>
    api.put(`/mcp-tools/${id}`, data).then(handleResponse),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/mcp-tools/${id}`).then(handleResponse),
  
  getRBAC: (id: string): Promise<MCPToolRBAC> =>
    api.get(`/mcp-tools/${id}/rbac`).then(handleResponse),
  
  updateRBAC: (id: string, rbac: MCPToolRBAC): Promise<MCPToolRBAC> =>
    api.put(`/mcp-tools/${id}/rbac`, rbac).then(handleResponse),
};

// LLMs API
export const llmsAPI = {
  list: (): Promise<ListResponse<LLM>> =>
    api.get('/llms').then(handleResponse),
  
  get: (id: string): Promise<LLM> =>
    api.get(`/llms/${id}`).then(handleResponse),
  
  create: (data: CreateLLMRequest): Promise<LLM> =>
    api.post('/llms', data).then(handleResponse),
  
  update: (id: string, data: Partial<CreateLLMRequest>): Promise<LLM> =>
    api.put(`/llms/${id}`, data).then(handleResponse),
  
  delete: (id: string): Promise<void> =>
    api.delete(`/llms/${id}`).then(handleResponse),
  
  getModels: (): Promise<ListResponse<LLMModel>> =>
    api.get('/llm-models').then(handleResponse),
};

// RAG API
export const ragAPI = {
  getConnectors: (): Promise<ListResponse<RAGConnector>> =>
    api.get('/rag/connectors').then(handleResponse),
  
  configureConnector: (connector: Partial<RAGConnector>): Promise<RAGConnector> =>
    api.post('/rag/connectors', connector).then(handleResponse),
  
  createConnector: (connector: Partial<RAGConnector>): Promise<RAGConnector> =>
    api.post('/rag/connectors', connector).then(handleResponse),
  
  updateConnector: (id: string, connector: Partial<RAGConnector>): Promise<RAGConnector> =>
    api.put(`/rag/connectors/${id}`, connector).then(handleResponse),
  
  deleteConnector: (id: string): Promise<void> =>
    api.delete(`/rag/connectors/${id}`).then(handleResponse),
  
  updateConnectorStatus: (id: string, enabled: boolean): Promise<RAGConnector> =>
    api.put(`/rag/connectors/${id}/status`, { enabled }).then(handleResponse),
  
  getMetricsConfig: (): Promise<RAGMetricsConfig> =>
    api.get('/rag/metrics-config').then(handleResponse),
  
  updateMetricsConfig: (config: RAGMetricsConfig): Promise<RAGMetricsConfig> =>
    api.put('/rag/metrics-config', config).then(handleResponse),
};

// Pipeline API
export const pipelineAPI = {
  getComponents: (): Promise<ListResponse<PipelineComponentType>> =>
    api.get('/pipeline-components').then(handleResponse),
  
  get: (id: string): Promise<Pipeline> =>
    api.get(`/pipelines/${id}`).then(handleResponse),
  
  save: (pipelineId: string, pipeline: any): Promise<Pipeline> =>
    api.put(`/pipelines/${pipelineId}`, pipeline).then(handleResponse),
  
  test: (agentId: string): Promise<{ success: boolean; message: string }> =>
    api.post(`/pipelines/${agentId}/test`).then(handleResponse),
};

// Security API
export const securityAPI = {
  getRoles: (): Promise<ListResponse<Role>> =>
    api.get('/security/roles').then(handleResponse),
  
  createRole: (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> =>
    api.post('/security/roles', role).then(handleResponse),
  
  updateRole: (id: string, role: Partial<Role>): Promise<Role> =>
    api.put(`/security/roles/${id}`, role).then(handleResponse),
  
  deleteRole: (id: string): Promise<void> =>
    api.delete(`/security/roles/${id}`).then(handleResponse),
  
  updateRolePermissions: (id: string, permissions: RolePermissions): Promise<Role> =>
    api.put(`/security/roles/${id}/permissions`, permissions).then(handleResponse),
  
  getRolePermissions: (roleName: string): Promise<RolePermissions> =>
    api.get(`/security/rbac/roles/${roleName}/permissions`).then(handleResponse),
  
  getResources: (): Promise<ListResponse<ResourceAccess>> =>
    api.get('/security/rbac/resources').then(handleResponse),
  
  getUsers: (): Promise<ListResponse<any>> =>
    api.get('/security/users').then(handleResponse),
  
  createUser: (user: any): Promise<any> =>
    api.post('/security/users', user).then(handleResponse),
  
  updateUser: (id: string, user: any): Promise<any> =>
    api.put(`/security/users/${id}`, user).then(handleResponse),
  
  deleteUser: (id: string): Promise<void> =>
    api.delete(`/security/users/${id}`).then(handleResponse),
  
  assignUserRole: (userId: string, roleId: string): Promise<void> =>
    api.post(`/security/users/${userId}/roles`, { role_id: roleId }).then(handleResponse),
  
  revokeUserRole: (userId: string, roleId: string): Promise<void> =>
    api.delete(`/security/users/${userId}/roles/${roleId}`).then(handleResponse),
  
  getResourceAccess: (userId: string): Promise<ListResponse<ResourceAccess>> =>
    api.get(`/security/users/${userId}/access`).then(handleResponse),
};

// Metrics API
export const metricsAPI = {
  getAgentPerformance: (): Promise<ListResponse<AgentPerformance>> =>
    api.get('/metrics/agent-performance').then(handleResponse),
  
  getPlatformComponents: (): Promise<ListResponse<PlatformComponentStatus>> =>
    api.get('/metrics/platform-components').then(handleResponse),
  
  getUserEngagement: (): Promise<ListResponse<UserEngagement>> =>
    api.get('/metrics/user-engagement').then(handleResponse),
  
  getUserSentiment: (): Promise<UserSentiment> =>
    api.get('/metrics/user-sentiment').then(handleResponse),
  
  getResourceMetrics: (): Promise<ListResponse<ResourceMetrics>> =>
    api.get('/metrics/resources').then(handleResponse),
  
  getServiceMetrics: (): Promise<ListResponse<ServiceMetrics>> =>
    api.get('/metrics/services').then(handleResponse),
  
  getLLMMetrics: (): Promise<ListResponse<LLMMetrics>> =>
    api.get('/metrics/llm').then(handleResponse),
  
  getRAGMetrics: (): Promise<RAGMetrics> =>
    api.get('/metrics/rag').then(handleResponse),
};

export default api;
