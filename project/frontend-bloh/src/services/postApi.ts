import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Tag } from '../pages/CreatePostPage/ComponentsForCreatePost/TagSelector'
import { PostResponse } from '../types/post.types'
import { getToken } from '../utils/cookies'

export const postApi = createApi({
	reducerPath: 'postApi',
	baseQuery: fetchBaseQuery({
		baseUrl: 'http://localhost:8000/api',
		prepareHeaders: headers => {
			const token = getToken()
			if (token) headers.set('Authorization', `Bearer ${token}`)
			return headers
		},
		credentials: 'include',
	}),
	endpoints: build => ({
		createPost: build.mutation<PostResponse, FormData>({
			query: formData => ({
				url: '/posts/create/',
				method: 'POST',
				body: formData,
			}),
		}),
		getTags: build.query<Tag[], void>({
			query: () => '/tags/',
		}),
		// далее будут и post creation, ingredients и т.д.
	}),
})

export const { useCreatePostMutation, useGetTagsQuery } = postApi
