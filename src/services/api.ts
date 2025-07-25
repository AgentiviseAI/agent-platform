// This file maintains backward compatibility while using the new modular structure
// All APIs are now separated into individual files for better organization

// Re-export all services from the new modular structure
export { 
  authAPI,
  agentsAPI,
  mcpToolsAPI,
  llmsAPI,
  ragAPI,
  workflowAPI,
  securityAPI,
  metricsAPI,
  api as default,
  handleResponse
} from './index';
