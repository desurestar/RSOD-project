import api from './instance'
import { PaginatedResponse, Tokens, User } from './types'

export const authAPI = {
	login: async (credentials: { username: string; password: string }) => {
		const response = await api.post<{ access: string; refresh: string }>(
			'auth/token/',
			credentials
		)
		return response.data
	},

	register: async (data: {
		username: string
		email: string
		password: string
	}) => {
		const response = await api.post<{
			tokens: Tokens
			user: User
		}>('auth/register/', data)
		return response.data
	},

	getProfile: async () => {
		const response = await api.get<User>('auth/profile/')
		return response.data
	},

	updateProfile: async (data: Partial<User>) => {
		const response = await api.patch<User>('auth/profile/', data)
		return response.data
	},

	updateAvatar: async (avatarFile: File) => {
		const formData = new FormData()
		formData.append('avatar', avatarFile)

		const response = await api.patch<User>('auth/profile/avatar/', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})

		if (response.data.avatar_url) {
			response.data.avatar_url += `?t=${Date.now()}`
		}
		return response.data
	},

	refreshToken: async (refresh: string) => {
		const response = await api.post<{ access: string }>('auth/token/refresh/', {
			refresh,
		})
		return response.data
	},

	getFollowers: async (userId: number) => {
		const response = await api.get<PaginatedResponse<User>>(
			`auth/users/${userId}/followers/`
		)
		return response.data.results
	},

	getFollowing: async (userId: number) => {
		const response = await api.get<PaginatedResponse<User>>(
			`auth/users/${userId}/following/`
		)
		return response.data.results
	},

	unsubscribe: async (userId: number) => {
		await api.post(`auth/users/${userId}/unsubscribe/`)
	},

	getAdminUsers: async () => {
		const response = await api.get<User[]>('auth/admin/users/')
		return response.data
	},

	updateAdminUser: async (userId: number, data: Partial<User>) => {
		const response = await api.put<User>(`auth/admin/users/${userId}/`, data)
		return response.data
	},

	deleteAdminUser: async (userId: number) => {
		await api.delete(`auth/admin/users/${userId}/`)
	},
}
