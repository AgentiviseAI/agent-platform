import { BaseEntity, EntityStatus } from './common';

// LLM types
export type HostingEnvironment = 'azure_ai_foundry' | 'aws_bedrock' | 'aws_sagemaker' | 'gcp_vertex_ai' | 'custom_deployment';
export type GCPAuthMethod = 'adc' | 'service_account' | 'api_key';
export type GCPModelType = 'foundation' | 'fine_tuned' | 'custom';
export type CustomDeploymentLocation = 'cloud' | 'on_premise' | 'hybrid';
export type CustomAPICompatibility = 'openai_compatible' | 'anthropic_compatible' | 'custom';
export type CustomAuthMethod = 'api_key_header' | 'bearer_token' | 'basic_auth' | 'oauth2' | 'none';

export interface LLM extends BaseEntity {
  name: string;
  description?: string;
  model_name: string;
  hosting_environment: HostingEnvironment;
  
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
  gcp_auth_method?: GCPAuthMethod;
  gcp_service_account_key?: string;
  gcp_api_key?: string;
  gcp_model_type?: GCPModelType;
  gcp_model_name?: string;
  
  // Custom Deployment fields
  custom_deployment_location?: CustomDeploymentLocation;
  custom_llm_provider?: string;
  custom_api_endpoint_url?: string;
  custom_api_compatibility?: CustomAPICompatibility;
  custom_auth_method?: CustomAuthMethod;
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
  status: EntityStatus;
  usage_stats?: LLMUsageStats;
}

export interface LLMUsageStats {
  requests_today: number;
  tokens_used: number;
  rate_limit: number;
}

export interface CreateLLMRequest {
  name: string;
  description?: string;
  model_name: string;
  hosting_environment: HostingEnvironment;
  
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
  gcp_auth_method?: GCPAuthMethod;
  gcp_service_account_key?: string;
  gcp_api_key?: string;
  gcp_model_type?: GCPModelType;
  gcp_model_name?: string;
  
  // Custom Deployment fields
  custom_deployment_location?: CustomDeploymentLocation;
  custom_llm_provider?: string;
  custom_api_endpoint_url?: string;
  custom_api_compatibility?: CustomAPICompatibility;
  custom_auth_method?: CustomAuthMethod;
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
  status: EntityStatus;
}

export interface UpdateLLMRequest extends Partial<CreateLLMRequest> {}

export interface LLMModel {
  id: string;
  name: string;
  description: string;
}
