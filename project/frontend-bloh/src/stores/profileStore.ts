import { create } from 'zustand'
import { Post, User } from '../api/types'
import { userAPI } from '../api/user'

interface ProfileState {
	profile: User | null
	posts: Post[]
	likedPosts: Post[]
	followers: User[]
	following: User[]
	loading: boolean
	error: string | null
	fetchProfile: (username: string) => Promise<void>
	fetchPosts: (username: string) => Promise<void>
	fetchLikedPosts: (username: string) => Promise<void>
	fetchFollowers: (username: string) => Promise<void>
	fetchFollowing: (username: string) => Promise<void>
	updateProfile: (data: Partial<User>) => Promise<void>
	uploadAvatar: (file: File) => Promise<void>
}

export const useProfileStore = create<ProfileState>(set => ({
	profile: null,
	posts: [],
	likedPosts: [],
	followers: [],
	following: [],
	loading: false,
	error: null,

	fetchProfile: async username => {
		set({ loading: true, error: null })
		try {
			const profile = await userAPI.getProfile(username)
			set({ profile, loading: false })
		} catch (error) {
			set({ error: 'Failed to load profile', loading: false })
		}
	},

	fetchPosts: async username => {
		set({ loading: true })
		try {
			const posts = await userAPI.getPosts(username)
			set({ posts, loading: false })
		} catch (error) {
			set({ error: 'Failed to load posts', loading: false })
		}
	},

	fetchLikedPosts: async username => {
		set({ loading: true })
		try {
			const likedPosts = await userAPI.getLikedPosts(username)
			set({ likedPosts, loading: false })
		} catch (error) {
			set({ error: 'Failed to load liked posts', loading: false })
		}
	},

	fetchFollowers: async username => {
		set({ loading: true })
		try {
			const followers = await userAPI.getFollowers(username)
			set({ followers, loading: false })
		} catch (error) {
			set({ error: 'Failed to load followers', loading: false })
		}
	},

	fetchFollowing: async username => {
		set({ loading: true })
		try {
			const following = await userAPI.getFollowing(username)
			set({ following, loading: false })
		} catch (error) {
			set({ error: 'Failed to load following', loading: false })
		}
	},

	updateProfile: async data => {
		set({ loading: true })
		try {
			const updatedProfile = await userAPI.updateProfile(data)
			set({
				profile: updatedProfile,
				loading: false,
			})
		} catch (error) {
			set({ error: 'Failed to update profile', loading: false })
		}
	},

	uploadAvatar: async file => {
		set({ loading: true })
		try {
			const { avatar_url } = await userAPI.uploadAvatar(file)
			set(state => ({
				profile: state.profile ? { ...state.profile, avatar_url } : null,
				loading: false,
			}))
		} catch (error) {
			set({ error: 'Failed to upload avatar', loading: false })
		}
	},
}))
