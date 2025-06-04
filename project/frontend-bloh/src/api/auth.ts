import api from './instance'
import { Tokens, User } from './types'

export const authAPI = {
	login: async (credentials: {
		username: string
		password: string
	}): Promise<Tokens> => {
		const response = await api.post<Tokens>('auth/token/', credentials)
		return response.data
	},

	register: async (data: {
		username: string
		email: string
		password: string
		password2: string
	}): Promise<Tokens> => {
		const response = await api.post<Tokens>('auth/register/', data)
		return response.data
	},

	getProfile: async (): Promise<User> => {
		const response = await api.get<User>('auth/profile/')
		return response.data
	},

	updateProfile: async (formData: FormData): Promise<User> => {
		const response = await api.put<User>('auth/profile/', formData)
		return response.data
	},

	updateAvatar: async (avatarFile: File): Promise<User> => {
		const formData = new FormData()
		formData.append('avatar', avatarFile)

		try {
			const response = await api.patch<User>('auth/profile/avatar/', formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})

			// Добавляем timestamp для избежания кэширования
			if (response.data.avatar_url) {
				response.data.avatar_url += `?t=${Date.now()}`
			}

			return response.data
		} catch (error) {
			console.error('Avatar upload failed:', error)
			throw error
		}
	},

	refreshToken: async (refresh: string): Promise<{ access: string }> => {
		const response = await api.post<{ access: string }>('auth/token/refresh/', {
			refresh,
		})
		return response.data
	},

	socialAuth: (provider: string) => {
		window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider}/`
	},

	getFollowers: async (userId: number): Promise<User[]> => {
		const response = await api.get<User[]>(`auth/users/${userId}/followers/`)
		return response.data
	},

	getFollowing: async (userId: number): Promise<User[]> => {
		const response = await api.get<User[]>(`auth/users/${userId}/following/`)
		return response.data
	},

	unsubscribe: async (userId: number): Promise<void> => {
		await api.post(`auth/users/${userId}/unsubscribe/`)
	},
}
