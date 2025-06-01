import { create } from 'zustand'
import { User } from '../types/auth.types'
import { removeToken, setToken } from '../utils/cookies'

interface AuthState {
	user: User | null
	setUser: (user: User | null) => void
	logout: () => void
	setTokenOnLogin: (token: string) => void
}

export const useAuthStore = create<AuthState>(set => ({
	user: null,
	setUser: user => set({ user }),
	logout: () => {
		removeToken()
		set({ user: null })
	},
	setTokenOnLogin: token => {
		setToken(token)
	},
}))
