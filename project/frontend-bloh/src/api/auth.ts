import api from './instance';
import { Tokens, User } from './types';

export const authAPI = {
  login: async (credentials: { username: string; password: string }): Promise<Tokens> => {
    const response = await api.post<Tokens>('auth/token/', credentials);
    return response.data;
  },
  
  register: async (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
  }): Promise<Tokens> => {
    const response = await api.post<Tokens>('auth/register/', data);
    return response.data;
  },
  
  getProfile: async (): Promise<User> => {
    const response = await api.get<User>('auth/profile/');
    return response.data;
  },
  
  refreshToken: async (refresh: string): Promise<{ access: string }> => {
    const response = await api.post<{ access: string }>('auth/token/refresh/', { refresh });
    return response.data;
  },
  
  socialAuth: (provider: string) => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider}/`;
  }
};