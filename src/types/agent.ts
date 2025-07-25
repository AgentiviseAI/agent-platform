import { BaseEntity } from './common';

// AI Agent types
export interface AIAgent extends BaseEntity {
  name: string;
  description: string;
  enabled: boolean;
  preview_enabled: boolean;
  workflow_id?: string;
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  enabled: boolean;
  preview_enabled: boolean;
}

export interface UpdateAgentRequest {
  name?: string;
  description?: string;
  enabled?: boolean;
  preview_enabled?: boolean;
  workflow_id?: string;
}
