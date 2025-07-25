import { AIAgent, CreateAgentRequest, Workflow, ListResponse } from '../types';
import api, { handleResponse } from './api-client';

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
  
  getWorkflow: (agentId: string): Promise<Workflow> =>
    api.get(`/agents/${agentId}/workflow`).then(handleResponse),
  
  updateWorkflow: (agentId: string, workflow: Workflow): Promise<Workflow> =>
    api.put(`/agents/${agentId}/workflow`, workflow).then(handleResponse),
};
