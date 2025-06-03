import api from './instance';
import { User, Post } from './types';

export const userAPI = {
  getProfile: async (username: string): Promise<User> => {
    const response = await api.get<User>(`users/${username}/`);
    return response.data;
  },
  
  getPosts: async (username: string): Promise<Post[]> => {
    const response = await api.get<Post[]>(`users/${username}/posts/`);
    return response.data;
  },
  
  getLikedPosts: async (username: string): Promise<Post[]> => {
    const response = await api.get<Post[]>(`users/${username}/liked/`);
    return response.data;
  },
  
  getFollowers: async (username: string): Promise<User[]> => {
    const response = await api.get<User[]>(`users/${username}/followers/`);
    return response.data;
  },
  
  getFollowing: async (username: string): Promise<User[]> => {
    const response = await api.get<User[]>(`users/${username}/following/`);
    return response.data;
  },
  
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('users/me/', data);
    return response.data;
  },
  
  uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.patch<{ avatar_url: string }>(
      'users/me/avatar/', 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};