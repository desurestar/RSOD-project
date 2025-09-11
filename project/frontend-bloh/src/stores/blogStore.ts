import { create } from 'zustand'
import { blogAPI } from '../api/blog'
import {
	Comment,
	CommentCreate,
	Ingredient,
	Post,
	PostCreate,
	Tag,
} from '../api/types'

interface BlogState {
	posts: Post[]
	adminPosts: Post[]
	currentPost: Post | null
	comments: Comment[]
	tags: Tag[]
	ingredients: Ingredient[]
	loading: boolean
	error: string | null

	fetchPosts: () => Promise<void>
	fetchAdminPosts: () => Promise<void>
	fetchPost: (id: number) => Promise<void>
	createPost: (data: PostCreate) => Promise<Post | null>
	updatePost: (id: number, data: Partial<PostCreate>) => Promise<void>
	deletePost: (id: number) => Promise<void>
	likePost: (id: number) => Promise<void>
	updatePostStatus: (id: number, status: string) => Promise<void>

	fetchComments: (postId: number) => Promise<void>
	createComment: (data: CommentCreate) => Promise<void>

	fetchTags: () => Promise<void>
	createTag: (data: Omit<Tag, 'id'>) => Promise<void>
	deleteTag: (id: number) => Promise<void>

	fetchIngredients: () => Promise<void>
	createIngredient: (data: Omit<Ingredient, 'id'>) => Promise<void>
	deleteIngredient: (id: number) => Promise<void>

	reset: () => void
}

export const useBlogStore = create<BlogState>(set => ({
	posts: [],
	adminPosts: [],
	currentPost: null,
	comments: [],
	tags: [],
	ingredients: [],
	loading: false,
	error: null,

	fetchPosts: async () => {
		set({ loading: true })
		try {
			const posts = await blogAPI.getPosts()
			set({ posts, loading: false })
		} catch (error) {
			set({ error: 'Failed to fetch posts', loading: false })
		}
	},

	fetchAdminPosts: async () => {
		set({ loading: true })
		try {
			const adminPosts = await blogAPI.getAdminPosts()
			set({ adminPosts, loading: false })
		} catch (error) {
			set({ error: 'Failed to fetch admin posts', loading: false })
		}
	},

	fetchPost: async id => {
		set({ loading: true })
		try {
			const post = await blogAPI.getPost(id)
			set({ currentPost: post, loading: false })
		} catch (error) {
			set({ error: 'Failed to fetch post', loading: false })
		}
	},

	createPost: async data => {
		set({ loading: true })
		try {
			const { ingredient_data, step_data, ...postData } = data
			// создаём базовый пост
			const newPost = await blogAPI.createPost(postData)
			// добавляем ингредиенты
			if (ingredient_data?.length) {
				await blogAPI.createPostIngredients(newPost.id, ingredient_data)
			}
			// добавляем шаги
			if (step_data?.length) {
				await blogAPI.createPostSteps(newPost.id, step_data)
			}
			// получаем полный пост
			const full = await blogAPI.getPost(newPost.id)
			set(state => ({
				posts: [full, ...state.posts],
				adminPosts: [full, ...state.adminPosts],
				currentPost: full,
				loading: false,
			}))
			return full
		} catch (e) {
			console.error('Create post error:', e)
			set({ error: 'Failed to create post', loading: false })
			return null
		}
	},

	updatePost: async (id, data) => {
		set({ loading: true })
		try {
			const { ingredient_data, step_data, ...base } = data

			await blogAPI.updatePost(id, base)

			if (ingredient_data) {
				await blogAPI.createPostIngredients(
					id,
					ingredient_data.map(i => ({
						ingredient_id: i.ingredient_id,
						quantity: i.quantity,
					})),
					{ replace: true }
				)
			}

			if (step_data) {
				await blogAPI.createPostSteps(
					id,
					step_data.map(s => ({
						order: s.order,
						description: s.description,
						image: s.image ?? null,
					})),
					{ replace: true }
				)
			}

			const full = await blogAPI.getPost(id)

			set(state => ({
				posts: state.posts.map(p => (p.id === id ? full : p)),
				adminPosts: state.adminPosts.map(p => (p.id === id ? full : p)),
				currentPost: state.currentPost?.id === id ? full : state.currentPost,
				loading: false,
			}))
		} catch (error) {
			console.error('Update post error:', error)
			set({ error: 'Failed to update post', loading: false })
		}
	},

	deletePost: async id => {
		set({ loading: true })
		try {
			await blogAPI.deletePost(id)
			set(state => ({
				posts: state.posts.filter(post => post.id !== id),
				adminPosts: state.adminPosts.filter(post => post.id !== id),
				currentPost: state.currentPost?.id === id ? null : state.currentPost,
				loading: false,
			}))
		} catch (error) {
			set({ error: 'Failed to delete post', loading: false })
		}
	},

	likePost: async id => {
		try {
			const { likes, is_liked } = await blogAPI.likePost(id)
			set(state => ({
				posts: state.posts.map(post =>
					post.id === id ? { ...post, likes_count: likes, is_liked } : post
				),
				adminPosts: state.adminPosts.map(post =>
					post.id === id ? { ...post, likes_count: likes, is_liked } : post
				),
				currentPost:
					state.currentPost?.id === id
						? {
								...state.currentPost,
								likes_count: likes,
								is_liked,
						  }
						: state.currentPost,
			}))
		} catch (error) {
			console.error('Like error:', error)
		}
	},

	updatePostStatus: async (id, status) => {
		set({ loading: true })
		try {
			const updatedPost = await blogAPI.updatePostStatus(id, status)
			set(state => ({
				adminPosts: state.adminPosts.map(post =>
					post.id === id ? updatedPost : post
				),
				currentPost:
					state.currentPost?.id === id ? updatedPost : state.currentPost,
				loading: false,
			}))
		} catch (error) {
			set({ error: 'Failed to update post status', loading: false })
		}
	},

	fetchComments: async postId => {
		set({ loading: true })
		try {
			const comments = await blogAPI.getComments(postId)
			set({ comments, loading: false })
		} catch (error) {
			set({ error: 'Failed to fetch comments', loading: false })
		}
	},

	createComment: async data => {
		set({ loading: true })
		try {
			const newComment = await blogAPI.createComment(data)
			set(state => ({
				comments: [newComment, ...state.comments],
				currentPost: state.currentPost
					? {
							...state.currentPost,
							comments_count: state.currentPost.comments_count + 1,
					  }
					: null,
				loading: false,
			}))
		} catch (error) {
			set({ error: 'Failed to create comment', loading: false })
		}
	},

	fetchTags: async () => {
		set({ loading: true })
		try {
			const tags = await blogAPI.getTags()
			set({ tags, loading: false })
		} catch (error) {
			set({ error: 'Failed to fetch tags', loading: false })
		}
	},

	createTag: async data => {
		try {
			const newTag = await blogAPI.createTag(data)
			set(state => ({ tags: [...state.tags, newTag] }))
		} catch (error) {
			console.error('Create tag error:', error)
		}
	},

	deleteTag: async id => {
		try {
			await blogAPI.deleteTag(id)
			set(state => ({ tags: state.tags.filter(tag => tag.id !== id) }))
		} catch (error) {
			console.error('Delete tag error:', error)
		}
	},

	fetchIngredients: async () => {
		set({ loading: true })
		try {
			const ingredients = await blogAPI.getIngredients()
			set({ ingredients, loading: false })
		} catch (error) {
			set({ error: 'Failed to fetch ingredients', loading: false })
		}
	},

	createIngredient: async data => {
		try {
			const newIngredient = await blogAPI.createIngredient(data)
			set(state => ({ ingredients: [...state.ingredients, newIngredient] }))
		} catch (error) {
			console.error('Create ingredient error:', error)
		}
	},

	deleteIngredient: async id => {
		try {
			await blogAPI.deleteIngredient(id)
			set(state => ({
				ingredients: state.ingredients.filter(ing => ing.id !== id),
			}))
		} catch (error) {
			console.error('Delete ingredient error:', error)
		}
	},

	reset: () =>
		set({
			posts: [],
			adminPosts: [],
			currentPost: null,
			comments: [],
			tags: [],
			ingredients: [],
			loading: false,
			error: null,
		}),
}))
