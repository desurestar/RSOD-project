import { Comment } from '../types/post.types'

export const mockComments: Comment[] = [
	{
		id: 1,
		content: 'Отличный рецепт! Обязательно попробую.',
		createdAt: '2025-04-10T12:00:00Z',
		author: {
			id: 1,
			username: 'katya_chef',
			displayName: 'Катя Шеф',
			avatarUrl: 'https://i.pravatar.cc/150?img=5',
		},
	},
	{
		id: 2,
		content: 'Очень вкусно получилось, спасибо!',
		createdAt: '2025-04-10T14:00:00Z',
		author: {
			id: 2,
			username: 'ivan_povar',
			displayName: 'Иван Повар',
			avatarUrl: 'https://i.pravatar.cc/150?img=10',
		},
		parentCommentId: 1,
	},
	{
		id: 3,
		content: 'Согласна, тоже понравилось!',
		createdAt: '2025-04-10T15:00:00Z',
		author: {
			id: 3,
			username: 'masha_k',
			displayName: 'Маша Кулинар',
			avatarUrl: 'https://i.pravatar.cc/150?img=7',
		},
		parentCommentId: 1,
	},
	{
		id: 4,
		content: 'А вы пробовали добавить немного чеснока?',
		createdAt: '2025-04-10T16:00:00Z',
		author: {
			id: 4,
			username: 'garlic_lover',
			displayName: 'Любитель Чеснока',
			avatarUrl: 'https://i.pravatar.cc/150?img=11',
		},
		parentCommentId: 1,
	},
	{
		id: 5,
		content: 'Я обычно делаю похожее, но с киноа!',
		createdAt: '2025-04-10T17:00:00Z',
		author: {
			id: 5,
			username: 'healthy_eater',
			displayName: 'ЗОЖник',
			avatarUrl: 'https://i.pravatar.cc/150?img=20',
		},
		parentCommentId: 1,
	},

	{
		id: 6,
		content: 'Уж лучше просто посмотреть видео на ютубе',
		createdAt: '2025-04-10T17:00:00Z',
		author: {
			id: 5,
			username: 'healthy_eater',
			displayName: 'ЗОЖник',
			avatarUrl: 'https://i.pravatar.cc/150?img=20',
		},
	},
]
