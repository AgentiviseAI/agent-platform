// Metrics and analytics types

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

export interface MetricsSummary {
  total_agents: number;
  active_agents: number;
  total_conversations: number;
  avg_response_time: number;
  system_health: 'healthy' | 'warning' | 'error';
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface MetricsFilter {
  start_date?: string;
  end_date?: string;
  agent_ids?: string[];
  llm_ids?: string[];
  granularity?: 'hour' | 'day' | 'week' | 'month';
}
