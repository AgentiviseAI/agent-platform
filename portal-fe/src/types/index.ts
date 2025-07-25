// Re-export all types from individual modules
export * from './common';
export * from './auth';
export * from './agent';
export * from './mcp-tool';
export * from './llm';
export * from './rag';
export * from './workflow';
export * from './security';
export * from './metrics';

// Additional utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
