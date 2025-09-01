import api from './instance'
import { PaginatedResponse, Post, User } from './types'

export const userAPI = {
	// ПРОФИЛЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
	getMyProfile: async (): Promise<User> => {
		const res = await api.get<User>('auth/profile/')
		return res.data
	},

	getSubscriptions: async (userId: number): Promise<User[]> => {
		const res = await api.get<PaginatedResponse<User>>(
			`auth/users/${userId}/following/`
		)
		return res.data.results
	},

	unsubscribe: async (userId: number): Promise<void> => {
		await api.post(`auth/users/${userId}/unsubscribe/`)
	},

	// Данные по username (если такие маршруты существуют)
	getProfile: async (username: string): Promise<User> => {
		const response = await api.get<User>(`users/${username}/`)
		return response.data
	},
	getPosts: async (username: string): Promise<Post[]> => {
		const response = await api.get<PaginatedResponse<Post>>(
			`users/${username}/posts/`
		)
		return response.data.results
	},
	getLikedPosts: async (username: string): Promise<Post[]> => {
		const response = await api.get<PaginatedResponse<Post>>(
			`users/${username}/liked/`
		)
		return response.data.results
	},
	getFollowers: async (username: string): Promise<User[]> => {
		const response = await api.get<PaginatedResponse<User>>(
			`users/${username}/followers/`
		)
		return response.data.results
	},
	getFollowing: async (username: string): Promise<User[]> => {
		const response = await api.get<PaginatedResponse<User>>(
			`users/${username}/following/`
		)
		return response.data.results
	},

	updateProfile: async (data: Partial<User>): Promise<User> => {
		const response = await api.patch<User>('users/me/', data)
		return response.data
	},

	uploadAvatar: async (file: File): Promise<{ avatar_url: string }> => {
		const formData = new FormData()
		formData.append('avatar', file)
		const response = await api.patch<{ avatar_url: string }>(
			'users/me/avatar/',
			formData,
			{ headers: { 'Content-Type': 'multipart/form-data' } }
		)
		return response.data
	},

	// Публичные по username (новый backend)
	getByUsername: async (username: string): Promise<User> => {
		const r = await api.get<User>(`auth/users/by-username/${username}/`)
		return r.data
	},
	getPublicById: async (userId: number): Promise<User> => {
		const r = await api.get<User>(`auth/users/${userId}/`)
		return r.data
	},
	getUserPosts: async (userId: number): Promise<Post[]> => {
		const r = await api.get<{ results?: Post[]; length?: number }>(
			`auth/users/${userId}/posts/`
		)
		// @ts-ignore
		return r.data.results ?? (r.data as unknown as Post[])
	},

	follow: async (userId: number): Promise<{ subscribed: boolean }> => {
		const r = await api.post<{ subscribed: boolean }>(
			`auth/users/${userId}/subscribe/`
		)
		return r.data
	},
	unfollow: async (userId: number): Promise<{ subscribed: boolean }> => {
		const r = await api.post<{ subscribed: boolean }>(
			`auth/users/${userId}/unsubscribe/`
		)
		return r.data
	},

	// Переименованные методы (раньше конфликтовали)
	getFollowersById: async (userId: number) => {
		const r = await api.get(`auth/users/${userId}/followers/`)
		// @ts-ignore
		return r.data.results ?? r.data
	},
	getFollowingById: async (userId: number) => {
		const r = await api.get(`auth/users/${userId}/following/`)
		// @ts-ignore
		return r.data.results ?? r.data
	},
}
