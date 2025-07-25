import { Role, RolePermissions, ResourceAccess, ListResponse } from '../types';
import api, { handleResponse } from './api-client';

// Security API
export const securityAPI = {
  getRoles: (): Promise<ListResponse<Role>> =>
    api.get('/security/roles').then(handleResponse),
  
  createRole: (role: Omit<Role, 'id' | 'created_at' | 'updated_at'>): Promise<Role> =>
    api.post('/security/roles', role).then(handleResponse),
  
  updateRole: (id: string, role: Partial<Role>): Promise<Role> =>
    api.put(`/security/roles/${id}`, role).then(handleResponse),
  
  deleteRole: (id: string): Promise<void> =>
    api.delete(`/security/roles/${id}`).then(handleResponse),
  
  updateRolePermissions: (id: string, permissions: RolePermissions): Promise<Role> =>
    api.put(`/security/roles/${id}/permissions`, permissions).then(handleResponse),
  
  getRolePermissions: (roleName: string): Promise<RolePermissions> =>
    api.get(`/security/rbac/roles/${roleName}/permissions`).then(handleResponse),
  
  getResources: (): Promise<ListResponse<ResourceAccess>> =>
    api.get('/security/rbac/resources').then(handleResponse),
  
  getUsers: (): Promise<ListResponse<any>> =>
    api.get('/security/users').then(handleResponse),
  
  createUser: (user: any): Promise<any> =>
    api.post('/security/users', user).then(handleResponse),
  
  updateUser: (id: string, user: any): Promise<any> =>
    api.put(`/security/users/${id}`, user).then(handleResponse),
  
  deleteUser: (id: string): Promise<void> =>
    api.delete(`/security/users/${id}`).then(handleResponse),
  
  assignUserRole: (userId: string, roleId: string): Promise<void> =>
    api.post(`/security/users/${userId}/roles`, { role_id: roleId }).then(handleResponse),
  
  revokeUserRole: (userId: string, roleId: string): Promise<void> =>
    api.delete(`/security/users/${userId}/roles/${roleId}`).then(handleResponse),
  
  getResourceAccess: (userId: string): Promise<ListResponse<ResourceAccess>> =>
    api.get(`/security/users/${userId}/access`).then(handleResponse),
};
