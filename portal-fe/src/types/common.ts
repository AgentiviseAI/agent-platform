// Common/base types used across the application
export interface ListResponse<T> {
  items: T[];
  total: number;
  page?: number;
  page_size?: number;
}

// Generic API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Common field types
export interface BaseEntity {
  id: string;
  created_at?: string;
  updated_at?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
}

// Status types
export type EntityStatus = 'active' | 'inactive' | 'pending' | 'disabled';
export type TransportType = 'Streamable HTTP';
