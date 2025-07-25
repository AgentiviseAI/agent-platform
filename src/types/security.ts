import { BaseEntity, EntityStatus } from './common';

// Security and Role types
export interface Role extends BaseEntity {
  name: string;
  description: string;
  status: EntityStatus;
  user_count: number;
  permissions?: RolePermissions;
  summary_permissions: string[];
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
  permissions: RolePermissions;
}

export interface UpdateRoleRequest extends Partial<CreateRoleRequest> {}

export interface ResourceAccess {
  resource_type: string;
  resource_id: string;
  access_level: 'read' | 'write' | 'admin';
  granted_by: string;
  granted_at: string;
  expires_at?: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource_type: string;
  action: string;
}

export interface UserRole {
  user_id: string;
  role_id: string;
  assigned_by: string;
  assigned_at: string;
  expires_at?: string;
}
