import { BaseEntity } from './common';

// RAG Connector types
export interface RAGConnector extends BaseEntity {
  name: string;
  type: 'wiki' | 'confluence' | 'database' | 'document' | 'spreadsheet';
  configured: boolean;
  enabled: boolean;
  connection_details: Record<string, any>;
}

export interface CreateRAGConnectorRequest {
  name: string;
  type: string;
  enabled: boolean;
  connection_details: Record<string, any>;
}

export interface UpdateRAGConnectorRequest extends Partial<CreateRAGConnectorRequest> {}

export interface RAGMetricsConfig {
  precision: number;
  recall: number;
  chunking_strategy: string;
  reranking_enabled: boolean;
  colbert_settings: string;
}
