// stores/blogStore.ts
import { create } from 'zustand';
import { blogAPI } from '../api/blog';
import { 
  Post, 
  Comment, 
  Tag, 
  Ingredient, 
  RecipeStep,
	PostCreate,
	CommentCreate
} from '../api/types';

interface BlogState {
  posts: Post[];
  currentPost: Post | null;
  comments: Comment[];
  tags: Tag[];
  ingredients: Ingredient[];
  recipeSteps: RecipeStep[];
  loading: boolean;
  error: string | null;
  
  // Posts
  fetchPosts: () => Promise<void>;
  fetchPost: (id: number) => Promise<void>;
  createPost: (data: PostCreate) => Promise<void>;
  updatePost: (id: number, data: Partial<PostCreate>) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  likePost: (id: number) => Promise<void>;
  
  // Comments
  fetchComments: (postId: number) => Promise<void>;
  createComment: (data: CommentCreate) => Promise<void>;
  updateComment: (id: number, data: Partial<CommentCreate>) => Promise<void>;
  deleteComment: (id: number) => Promise<void>;
  
  // Tags
  fetchTags: () => Promise<void>;
  createTag: (data: Omit<Tag, 'id'>) => Promise<void>;
  
  // Ingredients
  fetchIngredients: () => Promise<void>;
  createIngredient: (data: Omit<Ingredient, 'id'>) => Promise<void>;
  
  // Recipe Steps
  fetchRecipeSteps: () => Promise<void>;
  createRecipeStep: (data: Omit<RecipeStep, 'id'>) => Promise<void>;
}

export const useBlogStore = create<BlogState>((set) => ({
  posts: [],
  currentPost: null,
  comments: [],
  tags: [],
  ingredients: [],
  recipeSteps: [],
  loading: false,
  error: null,
  
  // Posts
  fetchPosts: async () => {
    set({ loading: true });
    try {
      const posts = await blogAPI.getPosts();
      set({ posts, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch posts', loading: false });
    }
  },
  
  fetchPost: async (id) => {
    set({ loading: true });
    try {
      const post = await blogAPI.getPost(id);
      set({ currentPost: post, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch post', loading: false });
    }
  },
  
  createPost: async (data) => {
    set({ loading: true });
    try {
      const newPost = await blogAPI.createPost(data);
      set((state) => ({ 
        posts: [newPost, ...state.posts], 
        loading: false 
      }));
    } catch (error) {
      set({ error: 'Failed to create post', loading: false });
    }
  },
  
  updatePost: async (id, data) => {
    set({ loading: true });
    try {
      const updatedPost = await blogAPI.updatePost(id, data);
      set((state) => ({
        posts: state.posts.map(post => 
          post.id === id ? updatedPost : post
        ),
        currentPost: updatedPost,
        loading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update post', loading: false });
    }
  },
  
  deletePost: async (id) => {
    set({ loading: true });
    try {
      await blogAPI.deletePost(id);
      set((state) => ({
        posts: state.posts.filter(post => post.id !== id),
        currentPost: null,
        loading: false
      }));
    } catch (error) {
      set({ error: 'Failed to delete post', loading: false });
    }
  },
  
  likePost: async (id) => {
    try {
      const { likes } = await blogAPI.likePost(id);
      set((state) => ({
        posts: state.posts.map(post => 
          post.id === id ? { ...post, likes_count: likes } : post
        ),
        currentPost: state.currentPost?.id === id 
          ? { ...state.currentPost, likes_count: likes } 
          : state.currentPost
      }));
    } catch (error) {
      console.error('Like error:', error);
    }
  },
  
  // Comments
  fetchComments: async (postId) => {
    set({ loading: true });
    try {
      const comments = await blogAPI.getComments(postId);
      set({ comments, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch comments', loading: false });
    }
  },
  
  createComment: async (data) => {
    set({ loading: true });
    try {
      const newComment = await blogAPI.createComment(data);
      set((state) => ({
        comments: [newComment, ...state.comments],
        currentPost: state.currentPost 
          ? { 
              ...state.currentPost, 
              comments_count: state.currentPost.comments_count + 1 
            } 
          : null,
        loading: false
      }));
    } catch (error) {
      set({ error: 'Failed to create comment', loading: false });
    }
  },
  
  updateComment: async (id, data) => {
    set({ loading: true });
    try {
      const updatedComment = await blogAPI.updateComment(id, data);
      set((state) => ({
        comments: state.comments.map(comment => 
          comment.id === id ? updatedComment : comment
        ),
        loading: false
      }));
    } catch (error) {
      set({ error: 'Failed to update comment', loading: false });
    }
  },
  
  deleteComment: async (id) => {
    set({ loading: true });
    try {
      await blogAPI.deleteComment(id);
      set((state) => ({
        comments: state.comments.filter(comment => comment.id !== id),
        currentPost: state.currentPost 
          ? { 
              ...state.currentPost, 
              comments_count: Math.max(0, state.currentPost.comments_count - 1) 
            } 
          : null,
        loading: false
      }));
    } catch (error) {
      set({ error: 'Failed to delete comment', loading: false });
    }
  },
  
  // Tags
  fetchTags: async () => {
    set({ loading: true });
    try {
      const tags = await blogAPI.getTags();
      set({ tags, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch tags', loading: false });
    }
  },
  
  createTag: async (data) => {
    try {
      const newTag = await blogAPI.createTag(data);
      set((state) => ({ tags: [...state.tags, newTag] }));
    } catch (error) {
      console.error('Create tag error:', error);
    }
  },
  
  // Ingredients
  fetchIngredients: async () => {
    set({ loading: true });
    try {
      const ingredients = await blogAPI.getIngredients();
      set({ ingredients, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch ingredients', loading: false });
    }
  },
  
  createIngredient: async (data) => {
    try {
      const newIngredient = await blogAPI.createIngredient(data);
      set((state) => ({ ingredients: [...state.ingredients, newIngredient] }));
    } catch (error) {
      console.error('Create ingredient error:', error);
    }
  },
  
  // Recipe Steps
  fetchRecipeSteps: async () => {
    set({ loading: true });
    try {
      const recipeSteps = await blogAPI.getRecipeSteps();
      set({ recipeSteps, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch recipe steps', loading: false });
    }
  },
  
  createRecipeStep: async (data) => {
    try {
      const newRecipeStep = await blogAPI.createRecipeStep(data);
      set((state) => ({ recipeSteps: [...state.recipeSteps, newRecipeStep] }));
    } catch (error) {
      console.error('Create recipe step error:', error);
    }
  },
}));