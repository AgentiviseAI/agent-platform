import axios from 'axios';
import { ProcessPromptRequest, ProcessPromptResponse } from '../types';

// Configuration from environment variables or defaults
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const chatAPI = {
  async sendMessage(request: ProcessPromptRequest): Promise<ProcessPromptResponse> {
    const response = await api.post<ProcessPromptResponse>('/process_prompt', request);
    return response.data;
  },

  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;
