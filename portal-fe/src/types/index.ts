// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user_role: string;
}

export interface User {
  username: string;
  role: string;
}

// AI Agent types
export interface AIAgent {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  preview_enabled: boolean;
  pipeline_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateAgentRequest {
  name: string;
  description: string;
  enabled: boolean;
  preview_enabled: boolean;
}

// MCP Tool types
export interface MCPTool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  endpoint_url: string;
  status: string;
  required_permissions?: string[];
  auth_headers?: Record<string, string>;
  created_at?: string;
  updated_at?: string;
}

export interface CreateMCPToolRequest {
  name: string;
  description: string;
  enabled: boolean;
  endpoint_url: string;
  status: string;
  required_permissions?: string[];
  auth_headers?: Record<string, string>;
}

export interface MCPToolRBAC {
  mcp_tool_id: string;
  roles_access: string[];
  auth_header_type: 'API Key' | 'Bearer Token' | 'None';
  auth_header_value: string;
}

// LLM types
export interface LLM {
  id: string;
  name: string;
  model_name: string;
  provider: string;
  enabled: boolean;
  status: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  config?: Record<string, any>;
  usage_stats?: {
    requests_today: number;
    tokens_used: number;
    rate_limit: number;
  };
  created_at?: string;
  updated_at?: string;
}

export interface CreateLLMRequest {
  name: string;
  model_name: string;
  provider: string;
  enabled: boolean;
  status: string;
  description?: string;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  config?: Record<string, any>;
}

export interface LLMModel {
  id: string;
  name: string;
  description: string;
}

// RAG types
export interface RAGConnector {
  id: string;
  name: string;
  type: 'wiki' | 'confluence' | 'database' | 'document' | 'spreadsheet';
  configured: boolean;
  enabled: boolean;
  connection_details: Record<string, any>;
}

export interface RAGMetricsConfig {
  precision: number;
  recall: number;
  chunking_strategy: string;
  reranking_enabled: boolean;
  colbert_settings: string;
}

// Pipeline types
export interface PipelineComponent {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  config?: Record<string, any>;
}

export interface PipelineEdge {
  source_component_id: string;
  target_component_id: string;
}

export interface Pipeline {
  id?: string;
  name?: string;
  agent_id: string;
  nodes: PipelineComponent[];
  edges: PipelineEdge[];
  created_at?: string;
  updated_at?: string;
}

export interface PipelineComponentType {
  id: string;
  name: string;
  description: string;
  category: string;
  properties: Record<string, any>;
}

// Security types
export interface Role {
  id: string;
  name: string;
  description: string;
  status: string;
  user_count: number;
  permissions?: RolePermissions;
  summary_permissions: string[];
  created_at?: string;
  updated_at?: string;
}

export interface RolePermissions {
  agents?: string[];
  llms?: string[];
  tools?: string[];
  rag?: string[];
  pipelines?: string[];
  metrics?: string[];
  security?: string[];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  status: string;
  permissions?: RolePermissions;
}

export interface ResourceAccess {
  resource_name: string;
  resource_type: string;
  access_roles: string[];
}

// Metrics types
export interface AgentPerformance {
  agent_id: string;
  agent_name: string;
  user_interactions: number;
  success_rate: number;
  failure_rate: number;
  avg_response_time: number;
}

export interface PlatformComponentStatus {
  component_name: string;
  status: 'healthy' | 'warning' | 'error';
  success_rate: number;
  error_count: number;
}

export interface UserEngagement {
  timestamp: string;
  active_users: number;
  new_users: number;
  total_interactions: number;
}

export interface UserSentiment {
  positive: number;
  neutral: number;
  negative: number;
}

export interface ResourceMetrics {
  timestamp: string;
  cpu_usage: number;
  memory_usage: number;
  gpu_usage?: number;
}

export interface ServiceMetrics {
  service_name: string;
  latency_ms: number;
  error_rate: number;
  throughput: number;
}

export interface LLMMetrics {
  llm_id: string;
  temperature: number;
  token_usage: number;
  cost: number;
  avg_response_length: number;
}

export interface RAGMetrics {
  precision: number;
  recall: number;
  f1_score: number;
  chunking_effectiveness: number;
}

// Security & RBAC types
export interface RolePermissions {
  agents?: string[];
  llms?: string[];
  tools?: string[];
  rag?: string[];
  pipelines?: string[];
  metrics?: string[];
  security?: string[];
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  status: string;
  permissions?: RolePermissions;
}

export interface ResourceAccess {
  resource: string;
  permissions: string[];
}

// API Response types
export interface ListResponse<T> {
  items: T[];
  total: number;
}

export interface ApiError {
  detail: string;
  code?: string;
}
