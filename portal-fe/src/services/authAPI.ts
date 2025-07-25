import { LoginRequest, LoginResponse } from '../types';
import api, { handleResponse } from './api-client';

// Authentication API
export const authAPI = {
  login: (data: LoginRequest): Promise<LoginResponse> =>
    api.post('/login', data).then(handleResponse),
  
  status: (): Promise<{ status: string }> =>
    api.get('/status').then(handleResponse),
};
