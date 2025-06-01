import { Post } from '../types/post.types'
import { articleTags } from './mockTags'

export const articlePosts: Post[] = [
	{
		id: 1,
		title: 'Как правильно питаться весной',
		excerpt:
			'Весна — время обновления, и питание играет ключевую роль в этом процессе. Вот несколько советов...',
		content:
			'Полный текст статьи о весеннем питании, витаминах, сезонных продуктах и балансе.',
		coverImage: '/images/articles/spring-nutrition.jpg',
		createdAt: '2025-04-15T10:00:00Z',
		updatedAt: '2025-04-15T10:00:00Z',
		author: {
			id: 1,
			username: 'foodguru',
			displayName: 'Food Guru',
			avatarUrl: '/avatars/foodguru.png',
		},
		tags: [articleTags[0], articleTags[8 - 1]],
		likesCount: 124,
		commentsCount: 8,
		viewsCount: 987,
		isLikedByCurrentUser: false,
		isSavedByCurrentUser: true,
	},

	{
		id: 2,
		title: 'Что купить на фермерском рынке',
		excerpt:
			'Фермерские рынки — отличный источник свежих и натуральных продуктов. Рассказываем, на что обратить внимание.',
		content:
			'Полный гайд по фермерским продуктам: от выбора молочных продуктов до сезонных овощей и фруктов.',
		coverImage: '/images/articles/farmers-market.jpg',
		createdAt: '2025-04-12T14:30:00Z',
		updatedAt: '2025-04-12T14:30:00Z',
		author: {
			id: 2,
			username: 'eco_chef',
			displayName: 'Eco Chef',
			avatarUrl: '/avatars/eco_chef.jpg',
		},
		tags: [articleTags[1], articleTags[7]],
		likesCount: 89,
		commentsCount: 5,
		viewsCount: 432,
		isLikedByCurrentUser: true,
		isSavedByCurrentUser: false,
	},
]
