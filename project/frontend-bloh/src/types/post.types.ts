export interface Author {
	id: number
	username: string
	displayName?: string
	avatarUrl?: string
	bio?: string
	isFollowedByCurrentUser?: boolean
}

export interface Tag {
	id: number
	name: string
	slug: string
	color?: string
}

export interface Ingredient {
	id: number
	name: string
	quantity: string
}

export interface RecipeStep {
	id: number
	order: number
	description: string
	image?: string
}

export interface Comment {
	id: number
	author: Author
	content: string
	createdAt: string
	parentCommentId?: number
}

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

	viewsCount: number
	calories?: number
	cookingTime?: number
}


export interface PostCreateRequest {
  title: string
  tags: number[]
  ingredients: { name: string; amount: string }[]
  steps: { description: string; image?: File }[]
  content: string
  cooking_time_minutes: number
  calories: number
  preview?: File
}

export interface PostResponse {
  id: number
  title: string
  content: string
  created_at: string
  author: {
    id: number
    username: string
    display_name: string
  }
}