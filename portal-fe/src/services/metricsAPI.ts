import { 
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
import api, { handleResponse } from './api-client';

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
