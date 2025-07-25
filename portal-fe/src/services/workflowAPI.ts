import { Workflow, WorkflowComponentType, ListResponse } from '../types';
import api, { handleResponse } from './api-client';

// Workflow API
export const workflowAPI = {
  getComponents: (): Promise<ListResponse<WorkflowComponentType>> =>
    api.get('/workflow-components').then(handleResponse),
  
  get: (id: string): Promise<Workflow> =>
    api.get(`/workflows/${id}`).then(handleResponse),
  
  save: (workflowId: string, workflow: any): Promise<Workflow> =>
    api.put(`/workflows/${workflowId}`, workflow).then(handleResponse),
  
  test: (agentId: string): Promise<{ success: boolean; message: string }> =>
    api.post(`/workflows/${agentId}/test`).then(handleResponse),

  getNodeOptions: (): Promise<{
    llms: Array<{ id: string; name: string; model_name: string; provider: string; enabled: boolean }>;
    mcp_tools: Array<{ id: string; name: string; description: string; endpoint_url: string; enabled: boolean }>;
    rag_connectors: Array<{ id: string; name: string; type: string; configured: boolean; enabled: boolean }>;
  }> =>
    api.get('/workflows/node-options').then(handleResponse),

  // Agent workflow management
  listByAgent: (agentId: string): Promise<ListResponse<Workflow>> =>
    api.get(`/agents/${agentId}/workflows`).then(handleResponse),
  
  createForAgent: (agentId: string, data: { name: string; description: string }): Promise<Workflow> =>
    api.post(`/agents/${agentId}/workflows`, data).then(handleResponse),
  
  updateWorkflow: (workflowId: string, data: { name: string; description: string }): Promise<Workflow> =>
    api.put(`/workflows/${workflowId}`, data).then(handleResponse),
  
  deleteWorkflow: (workflowId: string): Promise<void> =>
    api.delete(`/workflows/${workflowId}`).then(handleResponse),

  createSimpleWorkflow: (agentId: string): Promise<Workflow> =>
    api.post(`/agents/${agentId}/workflows/simple`).then(handleResponse),
};
