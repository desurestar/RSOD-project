import api from './instance'
import { 
    Post, 
    PostCreate, 
    Comment, 
    CommentCreate, 
    Tag, 
    Ingredient, 
    RecipeStep
} from './types'

export const blogAPI = {
    getPosts: async () => {
        const response = await api.get<Post[]>('blog/posts/')
        return response.data
    },

    getPost: async (id: number) => {
        const response = await api.get<Post>(`blog/posts/${id}/`)
        return response.data
    },

    likePost: async (id: number) => {
        const response = await api.post<{ likes: number }>(`blog/posts/${id}/likes/`)
        return response.data
    },

    getAdminPosts: async () => {
        const response = await api.get<Post[]>('blog/admin/posts/')
        return response.data
    },

    createPost: async (data: PostCreate) => {
        const formData = new FormData()
        
        // Основные поля
        formData.append('post_type', data.post_type)
        formData.append('title', data.title)
        formData.append('excerpt', data.excerpt)
        formData.append('content', data.content)
        if (data.cover_image) formData.append('cover_image', data.cover_image)
        
        // Теги
        data.tag_ids.forEach(id => formData.append('tag_ids', id.toString()))
        
        // Ингредиенты
        data.ingredient_data.forEach((item, index) => {
            formData.append(`ingredient_data[${index}][ingredient]`, item.ingredient.toString())
            formData.append(`ingredient_data[${index}][quantity]`, item.quantity)
        })
        
        // Шаги рецепта
        data.step_data.forEach((step, index) => {
            formData.append(`step_data[${index}][order]`, step.order.toString())
            formData.append(`step_data[${index}][description]`, step.description)
            if (step.image) {
                formData.append(`step_data[${index}][image]`, step.image)
            }
        })
        
        // Опциональные поля
        if (data.calories) formData.append('calories', data.calories.toString())
        if (data.cooking_time) formData.append('cooking_time', data.cooking_time.toString())

        const response = await api.post<Post>('blog/posts/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    },

    updatePost: async (id: number, data: Partial<PostCreate>) => {
        const formData = new FormData()
        
        // Основные поля
        if (data.post_type) formData.append('post_type', data.post_type)
        if (data.title) formData.append('title', data.title)
        if (data.excerpt) formData.append('excerpt', data.excerpt)
        if (data.content) formData.append('content', data.content)
        if (data.cover_image) formData.append('cover_image', data.cover_image)
        if (data.cover_image === null) formData.append('cover_image', '')
        
        // Теги
        if (data.tag_ids) {
            data.tag_ids.forEach(id => formData.append('tag_ids', id.toString()))
        }
        
        // Ингредиенты
        if (data.ingredient_data) {
            data.ingredient_data.forEach((item, index) => {
                formData.append(`ingredient_data[${index}][ingredient]`, item.ingredient.toString())
                formData.append(`ingredient_data[${index}][quantity]`, item.quantity)
            })
        }
        
        // Шаги рецепта
        if (data.step_data) {
            data.step_data.forEach((step, index) => {
                formData.append(`step_data[${index}][order]`, step.order.toString())
                formData.append(`step_data[${index}][description]`, step.description)
                if (step.image) {
                    formData.append(`step_data[${index}][image]`, step.image)
                }
            })
        }
        
        // Числовые поля
        if (data.calories) formData.append('calories', data.calories.toString())
        if (data.cooking_time) formData.append('cooking_time', data.cooking_time.toString())

        const response = await api.put<Post>(`blog/posts/${id}/`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return response.data
    },

    deletePost: async (id: number) => {
        await api.delete(`blog/posts/${id}/`)
    },

    updatePostStatus: async (id: number, status: string) => {
        const response = await api.patch<Post>(`blog/admin/posts/${id}/status/`, { status })
        return response.data
    },

    getComments: async (postId: number) => {
        const response = await api.get<Comment[]>(`blog/posts/${postId}/comments/`)
        return response.data
    },

    createComment: async (data: CommentCreate) => {
        const response = await api.post<Comment>('blog/comments/', data)
        return response.data
    },

    getTags: async () => {
        const response = await api.get<Tag[]>('blog/tags/')
        return response.data
    },

    createTag: async (data: Omit<Tag, 'id'>) => {
        const response = await api.post<Tag>('blog/tags/', data)
        return response.data
    },

    deleteTag: async (id: number) => {
        await api.delete(`blog/tags/${id}/`)
    },

    getIngredients: async () => {
        const response = await api.get<Ingredient[]>('blog/ingredients/')
        return response.data
    },

    createIngredient: async (data: Omit<Ingredient, 'id'>) => {
        const response = await api.post<Ingredient>('blog/ingredients/', data)
        return response.data
    },

    deleteIngredient: async (id: number) => {
        await api.delete(`blog/ingredients/${id}/`)
    },
}