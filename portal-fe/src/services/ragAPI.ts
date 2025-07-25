import { RAGConnector, RAGMetricsConfig, ListResponse } from '../types';
import api, { handleResponse } from './api-client';

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
