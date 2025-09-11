export interface User {
	id: number
	username: string
	email: string
	display_name: string
	avatar_url: string
	role: 'user' | 'admin'
	is_admin: boolean
	subscribers_count: number
	subscriptions_count: number
	posts_count: number
	liked_posts_count: number
	is_subscribed?: boolean // <-- добавлено
}

export interface Tag {
	id: number
	name: string
	slug: string
	color: string
}

export interface Ingredient {
	id: number
	name: string
}

export interface RecipeStep {
	id: number
	order: number
	description: string
	image: string | null
	image_url?: string | null
}

export interface PostIngredient {
	ingredient: Ingredient
	quantity: string
}

export interface Post {
	id: number
	post_type: 'recipe' | 'article'
	status: string
	title: string
	excerpt: string
	content: string
	cover_image: string | null
	cover_image_url?: string | null
	created_at: string
	updated_at: string
	author: User
	tags: Tag[]
	likes_count: number
	comments_count: number
	views_count?: number // добавлено
	is_liked?: boolean // добавлено
	calories?: number | null
	cooking_time?: number | null
	ingredients?: PostIngredient[]
	steps?: RecipeStep[]
}

export interface PostCreate {
	post_type: 'recipe' | 'article'
	status: string
	title: string
	excerpt: string
	content: string
	cover_image?: File | null
	tag_ids: number[]
	ingredient_data?: { ingredient_id: number; quantity: string }[]
	step_data?: { order: number; description: string; image?: File | null }[]
	calories?: number | null
	cooking_time?: number | null
}

export interface Comment {
	id: number
	post: number
	author: User
	content: string
	created_at: string
	parent_comment: number | null
}

export interface CommentCreate {
	post: number
	content: string
	parent_comment?: number | null
}

export interface Tokens {
	access: string
	refresh: string
}

export interface PaginatedResponse<T> {
	count: number
	next: string | null
	previous: string | null
	results: T[]
}
