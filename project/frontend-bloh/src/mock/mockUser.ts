import { User } from '../types/auth.types'

export const mockUsers: User[] = [
	{
		id: 1,
		username: 'chef_master',
		displayName: 'Шеф Повелитель',
		email: 'chef@example.com',
		avatarUrl:
			'https://distribution.faceit-cdn.net/images/146120f9-0a7f-4868-911d-cbc95178acb6.jpeg',
		role: 'user',
		subscribersCount: 125,
		subscriptionsCount: 42,
		postsCount: 17,
		likedPostsCount: 2,
		likedPosts: [1, 3, 5],
	},
]
