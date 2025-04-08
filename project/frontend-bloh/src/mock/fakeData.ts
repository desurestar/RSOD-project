// src/mock/fakeData.ts
import { Post } from '../types/post.types'

export const mockPosts: Post[] = [
	{
		id: 1,
		title: 'Летний салат с клубникой и шпинатом',
		excerpt:
			'Свежий салат с сочной клубникой, шпинатом и ореховой заправкой...',
		content: 'Полный рецепт с пошаговыми фото и рекомендациями.',
		coverImage:
			'https://avatars.dzeninfra.ru/get-zen_doc/3505723/pub_5ee07a8f4b294072cfa4f8d0_5ee11347599d2f6a6ed08697/scale_1200',
		createdAt: '2025-04-06T10:00:00Z',
		updatedAt: '2025-04-06T10:00:00Z',
		author: {
			id: 1,
			username: 'chef_anna',
			displayName: 'Анна Гастро',
			avatarUrl:
				'https://sun9-32.userapi.com/impf/c630428/v630428764/19c7c/L9zMskqn_VM.jpg?size=604x403&quality=96&sign=1ed0bbeac00feced13a6eeba30a68c86&c_uniq_tag=kZEZQFm16Nr8dw3o8R-vZ4Z00JCYHgG7lTJPhtrulvs&type=album',
			bio: 'Домашний повар и кулинарный блогер.',
		},
		tags: [
			{ id: 1, name: 'Салат', slug: 'salad' },
			{ id: 2, name: 'Лето', slug: 'summer' },
		],
		likesCount: 34,
		commentsCount: 12,
		isLikedByCurrentUser: false,
		isSavedByCurrentUser: true,
	},
	{
		id: 2,
		title: 'Овсяная каша с бананом и мёдом',
		excerpt: 'Идеальный завтрак за 10 минут!',
		content: 'Пошаговая инструкция для вкусной и полезной каши.',
		coverImage:
			'https://avatars.mds.yandex.net/i?id=a5b122b5c4a1b190535a8d384d358717_l-4353501-images-thumbs&n=13',
		createdAt: '2025-04-05T08:00:00Z',
		updatedAt: '2025-04-05T08:00:00Z',
		author: {
			id: 2,
			username: 'healthy_kate',
			displayName: 'Катя Фит',
			avatarUrl:
				'https://sun9-32.userapi.com/impf/c630428/v630428764/19c7c/L9zMskqn_VM.jpg?size=604x403&quality=96&sign=1ed0bbeac00feced13a6eeba30a68c86&c_uniq_tag=kZEZQFm16Nr8dw3o8R-vZ4Z00JCYHgG7lTJPhtrulvs&type=album',
		},
		tags: [
			{ id: 3, name: 'Каша', slug: 'porridge' },
			{ id: 4, name: 'Завтрак', slug: 'breakfast' },
		],
		likesCount: 57,
		commentsCount: 8,
		isLikedByCurrentUser: true,
		isSavedByCurrentUser: false,
	},

	{
		id: 3,
		title: 'Овсяная каша с бананом и мёдом',
		excerpt: 'Идеальный завтрак за 10 минут!',
		content: 'Пошаговая инструкция для вкусной и полезной каши.',
		coverImage:
			'https://avatars.mds.yandex.net/i?id=a5b122b5c4a1b190535a8d384d358717_l-4353501-images-thumbs&n=13',
		createdAt: '2025-04-05T08:00:00Z',
		updatedAt: '2025-04-05T08:00:00Z',
		author: {
			id: 2,
			username: 'healthy_kate',
			displayName: 'Катя Фит',
			avatarUrl:
				'https://sun9-32.userapi.com/impf/c630428/v630428764/19c7c/L9zMskqn_VM.jpg?size=604x403&quality=96&sign=1ed0bbeac00feced13a6eeba30a68c86&c_uniq_tag=kZEZQFm16Nr8dw3o8R-vZ4Z00JCYHgG7lTJPhtrulvs&type=album',
		},
		tags: [
			{ id: 3, name: 'Каша', slug: 'porridge' },
			{ id: 4, name: 'Завтрак', slug: 'breakfast' },
		],
		likesCount: 57,
		commentsCount: 8,
		isLikedByCurrentUser: true,
		isSavedByCurrentUser: false,
	},

	{
		id: 4,
		title: 'Овсяная каша с бананом и мёдом',
		excerpt: 'Идеальный завтрак за 10 минут!',
		content: 'Пошаговая инструкция для вкусной и полезной каши.',
		coverImage:
			'https://avatars.mds.yandex.net/i?id=a5b122b5c4a1b190535a8d384d358717_l-4353501-images-thumbs&n=13',
		createdAt: '2025-04-05T08:00:00Z',
		updatedAt: '2025-04-05T08:00:00Z',
		author: {
			id: 2,
			username: 'healthy_kate',
			displayName: 'Катя Фит',
			avatarUrl:
				'https://sun9-32.userapi.com/impf/c630428/v630428764/19c7c/L9zMskqn_VM.jpg?size=604x403&quality=96&sign=1ed0bbeac00feced13a6eeba30a68c86&c_uniq_tag=kZEZQFm16Nr8dw3o8R-vZ4Z00JCYHgG7lTJPhtrulvs&type=album',
		},
		tags: [
			{ id: 3, name: 'Каша', slug: 'porridge' },
			{ id: 4, name: 'Завтрак', slug: 'breakfast' },
		],
		likesCount: 57,
		commentsCount: 8,
		isLikedByCurrentUser: true,
		isSavedByCurrentUser: false,
	},

	{
		id: 5,
		title: 'Овсяная каша с бананом и мёдом',
		excerpt: 'Идеальный завтрак за 10 минут!',
		content: 'Пошаговая инструкция для вкусной и полезной каши.',
		coverImage:
			'https://avatars.mds.yandex.net/i?id=a5b122b5c4a1b190535a8d384d358717_l-4353501-images-thumbs&n=13',
		createdAt: '2025-04-05T08:00:00Z',
		updatedAt: '2025-04-05T08:00:00Z',
		author: {
			id: 2,
			username: 'healthy_kate',
			displayName: 'Катя Фит',
			avatarUrl:
				'https://sun9-32.userapi.com/impf/c630428/v630428764/19c7c/L9zMskqn_VM.jpg?size=604x403&quality=96&sign=1ed0bbeac00feced13a6eeba30a68c86&c_uniq_tag=kZEZQFm16Nr8dw3o8R-vZ4Z00JCYHgG7lTJPhtrulvs&type=album',
		},
		tags: [
			{ id: 3, name: 'Каша', slug: 'porridge' },
			{ id: 4, name: 'Завтрак', slug: 'breakfast' },
		],
		likesCount: 57,
		commentsCount: 8,
		isLikedByCurrentUser: true,
		isSavedByCurrentUser: false,
	},

	{
		id: 6,
		title: 'Овсяная каша с бананом и мёдом',
		excerpt: 'Идеальный завтрак за 10 минут!',
		content: 'Пошаговая инструкция для вкусной и полезной каши.',
		coverImage:
			'https://avatars.mds.yandex.net/i?id=a5b122b5c4a1b190535a8d384d358717_l-4353501-images-thumbs&n=13',
		createdAt: '2025-04-05T08:00:00Z',
		updatedAt: '2025-04-05T08:00:00Z',
		author: {
			id: 2,
			username: 'healthy_kate',
			displayName: 'Катя Фит',
			avatarUrl:
				'https://sun9-32.userapi.com/impf/c630428/v630428764/19c7c/L9zMskqn_VM.jpg?size=604x403&quality=96&sign=1ed0bbeac00feced13a6eeba30a68c86&c_uniq_tag=kZEZQFm16Nr8dw3o8R-vZ4Z00JCYHgG7lTJPhtrulvs&type=album',
		},
		tags: [
			{ id: 3, name: 'Каша', slug: 'porridge' },
			{ id: 4, name: 'Завтрак', slug: 'breakfast' },
		],
		likesCount: 57,
		commentsCount: 8,
		isLikedByCurrentUser: true,
		isSavedByCurrentUser: false,
	},
]
