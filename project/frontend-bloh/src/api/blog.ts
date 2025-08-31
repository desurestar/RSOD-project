import api from './instance'
import {
	Comment,
	CommentCreate,
	Ingredient,
	PaginatedResponse,
	Post,
	PostCreate,
	Tag,
} from './types'

export const blogAPI = {
	getPosts: async (params?: { post_type?: string }) => {
		const response = await api.get<PaginatedResponse<Post>>('blog/posts/', {
			params,
		})
		return response.data.results
	},

	getPost: async (id: number) => {
		const response = await api.get<Post>(`blog/posts/${id}/`)
		return response.data
	},

	likePost: async (id: number) => {
		const response = await api.post<{ likes: number }>(
			`blog/posts/${id}/likes/`
		)
		return response.data
	},

	viewPost: async (id: number) => {
		const response = await api.post<{ views: number }>(
			`blog/posts/${id}/views/`
		)
		return response.data
	},

	getAdminPosts: async () => {
		const response = await api.get<Post[]>('blog/admin/posts/')
		return response.data
	},

	createPost: async (
		data: Omit<PostCreate, 'ingredient_data' | 'step_data'>
	) => {
		const formData = new FormData()
		formData.append('post_type', data.post_type)
		formData.append('status', data.status)
		formData.append('title', data.title)
		formData.append('excerpt', data.excerpt)
		formData.append('content', data.content)
		if (data.calories !== undefined && data.calories !== null) {
			formData.append('calories', String(data.calories))
		}
		if (data.cooking_time !== undefined && data.cooking_time !== null) {
			formData.append('cooking_time', String(data.cooking_time))
		}
		if (data.cover_image) formData.append('cover_image', data.cover_image)
		data.tag_ids.forEach(id => formData.append('tag_ids', String(id)))
		const response = await api.post('/blog/posts/', formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return response.data
	},

	updatePost: async (id: number, data: Partial<PostCreate>) => {
		const formData = new FormData()

		// Основные поля
		if (data.post_type) formData.append('post_type', data.post_type)
		if (data.status) formData.append('status', data.status)
		if (data.title) formData.append('title', data.title)
		if (data.excerpt) formData.append('excerpt', data.excerpt)
		if (data.content) formData.append('content', data.content)

		// Числовые поля
		if (data.calories !== undefined && data.calories !== null) {
			formData.append('calories', String(data.calories))
		}
		if (data.cooking_time !== undefined && data.cooking_time !== null) {
			formData.append('cooking_time', String(data.cooking_time))
		}

		// Обложка
		if (data.cover_image) {
			formData.append('cover_image', data.cover_image)
		} else if (data.cover_image === null) {
			formData.append('cover_image', '')
		}

		// Теги
		if (data.tag_ids) {
			data.tag_ids.forEach(id => formData.append('tag_ids', String(id)))
		}

		// Ингредиенты
		if (data.ingredient_data) {
			const ingredientData = data.ingredient_data.map(item => ({
				ingredient_id: item.ingredient_id,
				quantity: item.quantity,
			}))
			formData.append('ingredient_data', JSON.stringify(ingredientData))
		}

		// Шаги
		if (data.step_data) {
			const stepsWithoutImages = data.step_data.map(step => ({
				order: step.order,
				description: step.description,
			}))
			formData.append('step_data', JSON.stringify(stepsWithoutImages))

			data.step_data.forEach((step, index) => {
				if (step.image) {
					formData.append(`step_images_${index}`, step.image)
				}
			})
		}

		const response = await api.put<Post>(`/blog/posts/${id}/`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return response.data
	},

	deletePost: async (id: number) => {
		await api.delete(`blog/posts/${id}/`)
	},

	updatePostStatus: async (id: number, status: string) => {
		const response = await api.patch<Post>(`blog/admin/posts/${id}/status/`, {
			status,
		})
		return response.data
	},

	getComments: async (postId: number) => {
		const response = await api.get<PaginatedResponse<Comment>>(
			`blog/posts/${postId}/comments/`
		)
		return response.data.results
	},

	createComment: async (data: CommentCreate) => {
		// Используем nested endpoint, чтобы backend сам проставил post
		const { post, content, parent_comment } = data
		const response = await api.post<Comment>(`blog/posts/${post}/comments/`, {
			content,
			parent_comment: parent_comment ?? null,
		})
		return response.data
	},

	getTags: async () => {
		const response = await api.get<PaginatedResponse<Tag>>('blog/tags/')
		return response.data.results
	},

	createTag: async (data: Omit<Tag, 'id'>) => {
		const response = await api.post<Tag>('blog/tags/', data)
		return response.data
	},

	deleteTag: async (id: number) => {
		await api.delete(`blog/tags/${id}/`)
	},

	getIngredients: async () => {
		const response = await api.get<PaginatedResponse<Ingredient>>(
			'blog/ingredients/'
		)
		return response.data.results
	},

	createIngredient: async (data: Omit<Ingredient, 'id'>) => {
		const response = await api.post<Ingredient>('blog/ingredients/', data)
		return response.data
	},

	deleteIngredient: async (id: number) => {
		await api.delete(`blog/ingredients/${id}/`)
	},

	createPostIngredients: async (
		postId: number,
		ingredients: { ingredient_id: number; quantity: string }[]
	) => {
		const response = await api.post(
			`/blog/posts/${postId}/ingredients/`,
			ingredients
		)
		return response.data
	},

	createPostSteps: async (
		postId: number,
		steps: { order: number; description: string; image?: File | null }[]
	) => {
		const formData = new FormData()
		// один JSON массив
		formData.append(
			'step_data',
			JSON.stringify(
				steps.map(s => ({
					order: s.order,
					description: s.description,
				}))
			)
		)
		steps.forEach((s, idx) => {
			if (s.image) formData.append(`step_images_${idx}`, s.image)
		})
		const response = await api.post(`/blog/posts/${postId}/steps/`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		})
		return response.data
	},
}
