import Cookies from 'js-cookie'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authAPI } from '../api/auth'
import { useBlogStore } from './blogStore'
import { Tokens, User } from '../api/types'

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
                    set({
                        user,
                        isAuthenticated: true,
                        loading: false,
                    })
                } catch (error) {
                    set({
                        error: 'Неверный логин или пароль',
                        loading: false,
                    })
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
                    const { tokens, user } = await authAPI.register({ username, email, password })
                    get().setTokens(tokens)
                    
                    set({
                        user,
                        isAuthenticated: true,
                        loading: false,
                    })
                } catch (error: any) {
                    let errorMessage = 'Ошибка регистрации'
                    if (error.response?.data) {
                        errorMessage = Object.entries(error.response.data)
                            .map(([key, msgs]) => `${key}: ${(msgs as string[]).join(', ')}`)
                            .join('\n')
                    }
                    set({
                        error: errorMessage,
                        loading: false,
                    })
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