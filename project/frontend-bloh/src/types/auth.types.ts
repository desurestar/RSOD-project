//auth.types.ts

export interface LikedPost {
	id: number
	title: string
	excerpt: string
}

export interface User {
	id: number
	username: string
	displayName?: string
	email?: string
	avatarUrl: string
	role: 'user' | 'admin'
	subscribersCount?: number
	subscriptionsCount?: number
	postsCount?: number
	likedPostsCount?: number
	likedPosts?: number[]
}
