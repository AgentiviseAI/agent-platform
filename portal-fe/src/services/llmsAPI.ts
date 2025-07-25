import { LLM, CreateLLMRequest, LLMModel, ListResponse } from '../types';
import api, { handleResponse } from './api-client';

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
