import { BaseEntity } from './common';

// Workflow types
export interface WorkflowComponent {
  id: string;
  label: string;
  type: string;
  link?: string | null;
  position: {
    x: number;
    y: number;
  };
  config?: Record<string, any>;
}

export interface WorkflowEdge {
  source: string;
  target: string;
}

export interface Workflow extends BaseEntity {
  name?: string;
  description?: string;
  agent_id: string;
  nodes: WorkflowComponent[];
  edges: WorkflowEdge[];
  status?: 'draft' | 'active' | 'inactive';
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  agent_id: string;
  nodes?: WorkflowComponent[];
  edges?: WorkflowEdge[];
}

export interface UpdateWorkflowRequest extends Partial<CreateWorkflowRequest> {}

export interface WorkflowComponentType {
  id: string;
  name: string;
  description: string;
  category: string;
  properties: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  execution_data?: Record<string, any>;
}
