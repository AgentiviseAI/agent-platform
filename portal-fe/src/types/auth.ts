// Authentication related types
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

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface CurrentUser {
  id: string;
  username: string;
  email?: string;
  role: string;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}
