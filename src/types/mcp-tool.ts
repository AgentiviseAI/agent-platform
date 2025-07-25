import { BaseEntity, TransportType } from './common';

// MCP Tool types
export interface MCPTool extends BaseEntity {
  name: string;
  description: string;
  enabled: boolean;
  endpoint_url: string;
  transport: TransportType;
  required_permissions?: string[];
  auth_headers?: Record<string, string>;
}

export interface CreateMCPToolRequest {
  name: string;
  description: string;
  enabled: boolean;
  endpoint_url: string;
  transport: TransportType;
  required_permissions?: string[];
  auth_headers?: Record<string, string>;
}

export interface UpdateMCPToolRequest {
  name?: string;
  description?: string;
  enabled?: boolean;
  endpoint_url?: string;
  transport?: TransportType;
  required_permissions?: string[];
  auth_headers?: Record<string, string>;
}

export interface MCPToolRBAC {
  mcp_tool_id: string;
  roles_access: string[];
  auth_header_type: 'API Key' | 'Bearer Token' | 'None';
  auth_header_value: string;
}
