import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query'
import { getToken } from '../utils/cookies'

export const api = createApi({
	baseQuery: fetchBaseQuery({
		baseUrl: '/api',
		prepareHeaders: headers => {
			const token = getToken()
			console.log(token)
			if (token) {
				headers.set('Authorization', `Bearer ${token}`)
			}	
			return headers
		},
	}),
	endpoints: () => ({}),
})
