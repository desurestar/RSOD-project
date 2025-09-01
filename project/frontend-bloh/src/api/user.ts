import { api } from './_base' // убедитесь что есть общий axios инстанс
import { Post, User } from './types'

export const userAPI = {
	getByUsername: async (username: string): Promise<User> => {
		const r = await api.get<User>(`users/by-username/${username}/`)
		return r.data
	},
	getUserPosts: async (userId: number): Promise<Post[]> => {
		const r = await api.get<Post[]>(`users/${userId}/posts/`)
		return r.data
	},
	follow: async (userId: number): Promise<{ subscribed: boolean }> => {
		const r = await api.post<{ subscribed: boolean }>(`users/${userId}/follow/`)
		return r.data
	},
	unfollow: async (userId: number): Promise<{ subscribed: boolean }> => {
		const r = await api.post<{ subscribed: boolean }>(
			`users/${userId}/unfollow/`
		)
		return r.data
	},
}
