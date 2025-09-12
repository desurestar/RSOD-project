import Cookies from 'js-cookie'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../api/auth'
import { Tokens, User } from '../api/types'
import { translateErrorPayload } from '../utils/errorTranslate'
import { useBlogStore } from './blogStore'

interface AuthState {
	user: User | null
	isAuthenticated: boolean
	loading: boolean
	error: string | null
	login: (username: string, password: string) => Promise<void>
	register: (username: string, email: string, password: string) => Promise<void>
	logout: () => Promise<void>
	fetchProfile: () => Promise<void>
	setTokens: (tokens: Tokens) => void
	updateUser: (userData: Partial<User>) => void
	isAdmin: () => boolean
	adjustLikedPostsCount: (delta: number) => void
	clearError: () => void
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			isAuthenticated: false,
			loading: false,
			error: null,

			login: async (username, password) => {
				set({ loading: true, error: null })
				try {
					const tokens = await authAPI.login({ username, password })
					get().setTokens(tokens)
					const user = await authAPI.getProfile()
					set({ user, isAuthenticated: true, loading: false })
				} catch (error: any) {
					const data = error?.response?.data
					const errorMessage =
						translateErrorPayload(data, 'Ошибка авторизации') ||
						'Ошибка авторизации'
					set({ error: errorMessage, loading: false })
					throw error
				}
			},

			isAdmin: () => {
				const user = get().user
				return user ? user.role === 'admin' || user.is_admin : false
			},

			updateUser: userData =>
				set(state => ({
					user: state.user ? { ...state.user, ...userData } : null,
				})),

			register: async (username, email, password) => {
				set({ loading: true, error: null })
				try {
					const { tokens, user } = await authAPI.register({
						username,
						email,
						password,
					})
					get().setTokens(tokens)
					set({ user, isAuthenticated: true, loading: false })
				} catch (error: any) {
					const data = error?.response?.data
					const errorMessage =
						translateErrorPayload(data, 'Ошибка регистрации') ||
						'Ошибка регистрации'
					set({ error: errorMessage, loading: false })
					throw error
				}
			},

			logout: async () => {
				set({ loading: true })
				try {
					Cookies.remove('access_token')
					Cookies.remove('refresh_token')
					useBlogStore.getState().reset()
					set({
						user: null,
						isAuthenticated: false,
						loading: false,
					})
				} catch (error) {
					set({ loading: false })
					throw error
				}
			},

			fetchProfile: async () => {
				set({ loading: true })
				try {
					const user = await authAPI.getProfile()
					set({
						user,
						isAuthenticated: true,
						loading: false,
					})
				} catch (error) {
					Cookies.remove('access_token')
					Cookies.remove('refresh_token')
					set({
						user: null,
						isAuthenticated: false,
						loading: false,
					})
				}
			},

			setTokens: tokens => {
				Cookies.set('access_token', tokens.access)
				Cookies.set('refresh_token', tokens.refresh)
				set({ isAuthenticated: true })
			},

			adjustLikedPostsCount: delta =>
				set(state =>
					state.user
						? {
								user: {
									...state.user,
									liked_posts_count: Math.max(
										0,
										state.user.liked_posts_count + delta
									),
								},
						  }
						: state
				),
			clearError: () => set({ error: null }),
		}),
		{
			name: 'auth-storage',
			partialize: state => ({
				isAuthenticated: state.isAuthenticated,
				user: state.user,
			}),
		}
	)
)
