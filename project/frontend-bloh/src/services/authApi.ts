import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import Cookies from 'js-cookie'
import { User } from '../types/auth.types'

const BASE_URL = 'http://localhost:8000/api'

interface LoginRequest {
	username: string
	password: string
}

interface LoginResponse {
	access: string
	refresh: string
	user: {
    id: number
    username: string
    email: string
    display_name: string
    avatar_url?: string
    role?: string
  }
}

interface RegisterRequest {
	username: string
	email?: string
	password: string
	display_name?: string
}

interface RegisterResponse {
	access: string
  refresh: string
  user: {
    id: number
    username: string
    email: string
    display_name: string
    avatar_url?: string
    role?: string
  }
}

export const authApi = createApi({
	reducerPath: 'authApi',
	baseQuery: fetchBaseQuery({
		baseUrl: BASE_URL,
		prepareHeaders: headers => {
			const token = Cookies.get('token')
			if (token) {
				headers.set('Authorization', `Bearer ${token}`)
			}
			return headers
		},
		credentials: 'include',
	}),
	endpoints: build => ({
		login: build.mutation<LoginResponse, LoginRequest>({
			query: body => ({
				url: '/users/login/',
				method: 'POST',
				body,
			}),
		}),
		register: build.mutation<RegisterResponse, RegisterRequest>({
			query: body => ({
				url: '/users/register/',
				method: 'POST',
				body,
			}),
		}),
		getMe: build.query<User, void>({
			query: () => ({
				url: '/users/me/',
				method: 'GET',
			}),
		}),
	}),
})

export const { useLoginMutation, useRegisterMutation, useGetMeQuery } = authApi
