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
  workflow_id?: string;
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
  description?: string;
  model_name: string;
  hosting_environment: 'azure_ai_foundry' | 'aws_bedrock' | 'aws_sagemaker' | 'gcp_vertex_ai' | 'custom_deployment';
  
  // Azure AI Foundry fields
  azure_endpoint_url?: string;
  azure_api_key?: string;
  azure_deployment_name?: string;
  
  // AWS Bedrock fields
  aws_region?: string;
  aws_access_key_id?: string;
  aws_secret_access_key?: string;
  aws_model_id?: string;
  
  // AWS SageMaker fields
  aws_sagemaker_endpoint_name?: string;
  aws_content_handler_class?: string;
  
  // Google Cloud Vertex AI fields
  gcp_project_id?: string;
  gcp_region?: string;
  gcp_auth_method?: 'adc' | 'service_account' | 'api_key';
  gcp_service_account_key?: string;
  gcp_api_key?: string;
  gcp_model_type?: 'foundation' | 'fine_tuned' | 'custom';
  gcp_model_name?: string;
  
  // Custom Deployment fields
  custom_deployment_location?: 'cloud' | 'on_premise' | 'hybrid';
  custom_llm_provider?: string;
  custom_api_endpoint_url?: string;
  custom_api_compatibility?: 'openai_compatible' | 'anthropic_compatible' | 'custom';
  custom_auth_method?: 'api_key_header' | 'bearer_token' | 'basic_auth' | 'oauth2' | 'none';
  custom_auth_header_name?: string;
  custom_auth_key_prefix?: string;
  custom_auth_api_key?: string;
  custom_auth_username?: string;
  custom_auth_password?: string;
  custom_oauth2_token_url?: string;
  custom_oauth2_client_id?: string;
  custom_oauth2_client_secret?: string;
  
  // Model configuration
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop_sequences?: string;
  
  // System fields
  enabled: boolean;
  status: string;
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
  description?: string;
  model_name: string;
  hosting_environment: 'azure_ai_foundry' | 'aws_bedrock' | 'aws_sagemaker' | 'gcp_vertex_ai' | 'custom_deployment';
  
  // Azure AI Foundry fields
  azure_endpoint_url?: string;
  azure_api_key?: string;
  azure_deployment_name?: string;
  
  // AWS Bedrock fields
  aws_region?: string;
  aws_access_key_id?: string;
  aws_secret_access_key?: string;
  aws_model_id?: string;
  
  // AWS SageMaker fields
  aws_sagemaker_endpoint_name?: string;
  aws_content_handler_class?: string;
  
  // Google Cloud Vertex AI fields
  gcp_project_id?: string;
  gcp_region?: string;
  gcp_auth_method?: 'adc' | 'service_account' | 'api_key';
  gcp_service_account_key?: string;
  gcp_api_key?: string;
  gcp_model_type?: 'foundation' | 'fine_tuned' | 'custom';
  gcp_model_name?: string;
  
  // Custom Deployment fields
  custom_deployment_location?: 'cloud' | 'on_premise' | 'hybrid';
  custom_llm_provider?: string;
  custom_api_endpoint_url?: string;
  custom_api_compatibility?: 'openai_compatible' | 'anthropic_compatible' | 'custom';
  custom_auth_method?: 'api_key_header' | 'bearer_token' | 'basic_auth' | 'oauth2' | 'none';
  custom_auth_header_name?: string;
  custom_auth_key_prefix?: string;
  custom_auth_api_key?: string;
  custom_auth_username?: string;
  custom_auth_password?: string;
  custom_oauth2_token_url?: string;
  custom_oauth2_client_id?: string;
  custom_oauth2_client_secret?: string;
  
  // Model configuration
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop_sequences?: string;
  
  // System fields
  enabled: boolean;
  status: string;
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

export interface Workflow {
  id?: string;
  name?: string;
  description?: string;
  agent_id: string;
  nodes: WorkflowComponent[];
  edges: WorkflowEdge[];
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowComponentType {
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
  workflows?: string[];
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
  workflows?: string[];
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
