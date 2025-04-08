// src/types/post.types.ts

// Автор поста
export interface Author {
	id: number
	username: string
	displayName?: string
	avatarUrl?: string
	bio?: string
	isFollowedByCurrentUser?: boolean
}

// Тег (например: "Салат", "Каша")
export interface Tag {
	id: number
	name: string
	slug: string
}

// Ингредиент поста (если пост — это рецепт)
export interface Ingredient {
	id: number
	name: string
	quantity: string
}

// Шаг приготовления
export interface RecipeStep {
	id: number
	order: number
	description: string
	image?: string
}

// Комментарий к посту
export interface Comment {
	id: number
	author: Author
	content: string
	createdAt: string
	parentCommentId?: number // для вложенных комментариев
}

// Сам пост
export interface Post {
	id: number
	title: string
	excerpt: string
	content: string
	coverImage: string
	createdAt: string
	updatedAt: string
	author: Author
	tags: Tag[]
	ingredients?: Ingredient[]
	recipeSteps?: RecipeStep[]
	comments?: Comment[]

	likesCount: number
	commentsCount: number
	isLikedByCurrentUser?: boolean
	isSavedByCurrentUser?: boolean
}
