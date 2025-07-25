import { MCPTool, CreateMCPToolRequest, MCPToolRBAC, ListResponse } from '../types';
import api, { handleResponse } from './api-client';

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
