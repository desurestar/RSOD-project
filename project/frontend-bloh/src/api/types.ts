  // api/types.ts

  // User
  export interface User {
    id: number;
    username: string;
    email: string;
    display_name: string;
    avatar_url: string;
    role: 'user' | 'admin';
    subscribers_count: number;
    subscriptions_count: number;
    posts_count: number;
    liked_posts_count: number;
  }

  // Auth
  export interface LoginData {
    username: string;
    password: string;
  }

  export interface RegisterData {
    username: string;
    email: string;
    password: string;
    display_name?: string;
  }

  export interface Tokens {
    access: string;
    refresh: string;
  }

  // Tag
  export interface Tag {
    id: number;
    name: string;
    slug: string;
    color: string;
  }

  // Ingredient
  export interface Ingredient {
    id: number;
    name: string;
    quantity: string;
  }

  // Recipe Step
  export interface RecipeStep {
    id: number;
    order: number;
    description: string;
    image: string | null;
  }

  // Post
  export interface Post {
    id: number;
    post_type: 'recipe' | 'article';
    title: string;
    excerpt: string;
    content: string;
    cover_image: string | null;
    created_at: string;
    updated_at: string;
    author: User;
    tags: Tag[];
    ingredients: Ingredient[];
    recipe_steps: RecipeStep[];
    likes_count: number;
    comments_count: number;
    views_count: number;
    calories: number | null;
    cooking_time: number | null;
  }

  export interface PostCreate {
    post_type: 'recipe' | 'article';
    title: string;
    excerpt: string;
    content: string;
    cover_image?: File | null;
    tag_ids: number[];
    ingredient_ids: number[];
    recipe_step_ids: number[];
    calories?: number | null;
    cooking_time?: number | null;
  }

  // Comment
  export interface Comment {
    id: number;
    post: number;
    author: User;
    content: string;
    created_at: string;
    parent_comment: number | null;
  }

  export interface CommentCreate {
    post: number;
    content: string;
    parent_comment?: number | null;
  }