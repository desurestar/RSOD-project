import { configureStore } from '@reduxjs/toolkit'
import { api } from '../services/api'
import { authApi } from '../services/authApi'
import { postApi } from '../services/postApi'
import { tagApi } from '../services/tagApi'

export const store = configureStore({
	reducer: {
		[api.reducerPath]: api.reducer,
		[authApi.reducerPath]: authApi.reducer,
		[postApi.reducerPath]: postApi.reducer,
		[tagApi.reducerPath]: tagApi.reducer
	},
	middleware: getDefault =>
		getDefault().concat(api.middleware, authApi.middleware, postApi.middleware, tagApi.middleware),
})
