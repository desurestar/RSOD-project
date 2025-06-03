// api/blog.ts
import api from './instance';
import { 
  Post, 
  PostCreate, 
  Comment, 
  CommentCreate, 
  Tag, 
  Ingredient, 
  RecipeStep 
} from './types';

export const blogAPI = {
  // Posts
  getPosts: async (): Promise<Post[]> => {
    const response = await api.get<Post[]>('blog/posts/');
    return response.data;
  },
  
  getPost: async (id: number): Promise<Post> => {
    const response = await api.get<Post>(`blog/posts/${id}/`);
    return response.data;
  },
  
  createPost: async (data: PostCreate): Promise<Post> => {
    const formData = new FormData();
    
    // Добавляем поля
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'cover_image' && value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}`, item.toString()));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    const response = await api.post<Post>('blog/posts/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  updatePost: async (id: number, data: Partial<PostCreate>): Promise<Post> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'cover_image' && value instanceof File) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}`, item.toString()));
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    const response = await api.put<Post>(`blog/posts/${id}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  
  deletePost: async (id: number): Promise<void> => {
    await api.delete(`blog/posts/${id}/`);
  },
  
  likePost: async (id: number): Promise<{ likes: number }> => {
    const response = await api.post<{ likes: number }>(`blog/posts/${id}/like/`);
    return response.data;
  },
  
  // Comments
  getComments: async (postId: number): Promise<Comment[]> => {
    const response = await api.get<Comment[]>(`blog/comments/?post=${postId}`);
    return response.data;
  },
  
  createComment: async (data: CommentCreate): Promise<Comment> => {
    const response = await api.post<Comment>('blog/comments/', data);
    return response.data;
  },
  
  updateComment: async (id: number, data: Partial<CommentCreate>): Promise<Comment> => {
    const response = await api.put<Comment>(`blog/comments/${id}/`, data);
    return response.data;
  },
  
  deleteComment: async (id: number): Promise<void> => {
    await api.delete(`blog/comments/${id}/`);
  },
  
  // Tags
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get<Tag[]>('blog/tags/');
    return response.data;
  },
  
  createTag: async (data: Omit<Tag, 'id'>): Promise<Tag> => {
    const response = await api.post<Tag>('blog/tags/', data);
    return response.data;
  },
  
  // Ingredients
  getIngredients: async (): Promise<Ingredient[]> => {
    const response = await api.get<Ingredient[]>('blog/ingredients/');
    return response.data;
  },
  
  createIngredient: async (data: Omit<Ingredient, 'id'>): Promise<Ingredient> => {
    const response = await api.post<Ingredient>('blog/ingredients/', data);
    return response.data;
  },
  
  // Recipe Steps
  getRecipeSteps: async (): Promise<RecipeStep[]> => {
    const response = await api.get<RecipeStep[]>('blog/recipesteps/');
    return response.data;
  },
  
  createRecipeStep: async (data: Omit<RecipeStep, 'id'>): Promise<RecipeStep> => {
    const response = await api.post<RecipeStep>('blog/recipesteps/', data);
    return response.data;
  },
};