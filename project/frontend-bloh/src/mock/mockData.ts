import { Post } from '../types/post.types'

export const mockPosts: Post[] = [
	{
		id: 1,
		title: 'Летний салат с клубникой и шпинатом',
		excerpt:
			'Свежий салат с сочной клубникой, шпинатом и ореховой заправкой...',
		content:
			'Как только вода впитается в рис, выключите огонь и оставьте рис постоять под крышкой еще минут 15. Затем можете подавать горячим. Такой гарнир из риса подойдет ко многим блюдам! Приятного аппетита! Важно! Чтобы блюда с рисом получались неизменно вкусными, читайте статью о тонкостях выбора риса и секретах его приготовления. Любые масла полезны только до достижения определённой температуры - точки дымления, при которой масло начинает гореть и в нём образуются токсичные вещества, в том числе канцерогены. Как определиться с температурой обжаривания и выбрать лучшее масло для жарки, а какое лучше не использовать совсем, читайте здесь. Важно! Неправильно подобранная сковорода может испортить даже самый хороший рецепт. Все подробности, как выбрать идеальную сковородку для разных блюд читай здесь. Для приготовления лучше использовать нейтральную по вкусу фильтрованную или бутилированную воду. Если же вы используете воду из-под крана, имейте в виду, что она может придать блюду неприятный характерный привкус. Так как степень солености, сладости, горечи, остроты, кислоты, жгучести у каждого индивидуальная, всегда добавляйте специи, пряности и приправы, ориентируясь на свой вкус! Если какую-то из приправ вы кладете впервые, то учтите, что есть специи, которые особенно важно не переложить (например, перец чили). Большинство из нас готовит рис, просто сварив его в кастрюле. Но почему бы не подойти к его приготовлению по новому - в сковороде? Такой рис можно использовать в качестве самостоятельного блюда или гарнира к мясным или рыбным блюдам. При приготовлении риса, на стадии обжарки лука, можно использовать и другие овощи, такие как морковь, помидоры, брокколи. Такие овощные добавления сделают рис не только вкусным, но и более полезным. Сковороду лучше всего использовать с толстым дном или с антипригарным покрытием, иначе рис может подгореть. Чтобы рис не превратился в кашу, всегда используйте пропорцию 1/2 - на одну порцию риса берите две порции воды. Для аромата можете добавить при приготовлении несколько зубчиков чеснока. Но когда рис будет готов, их нужно вытащить.',
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
		ingredients: [
			{ id: 1, name: 'Шпинат', quantity: '100 г' },
			{ id: 2, name: 'Клубника', quantity: '200 г' },
			{ id: 3, name: 'Орехи', quantity: '50 г' },
		],
		recipeSteps: [
			{ id: 1, order: 1, description: 'Подготовьте ингредиенты.' },
			{ id: 2, order: 2, description: 'Смешайте шпинат и клубнику.' },
			{ id: 3, order: 3, description: 'Добавьте орехи и заправку.' },
		],
		likesCount: 34,
		commentsCount: 12,
		isLikedByCurrentUser: false,
		isSavedByCurrentUser: true,
		viewsCount: 250,
		calories: 150,
		cookingTime: 15,
		comments: [],
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
		ingredients: [
			{ id: 1, name: 'Овсяные хлопья', quantity: '50 г' },
			{ id: 2, name: 'Банан', quantity: '1 шт.' },
			{ id: 3, name: 'Мёд', quantity: '1 ст. л.' },
		],
		recipeSteps: [
			{ id: 1, order: 1, description: 'Нагрейте молоко или воду.' },
			{ id: 2, order: 2, description: 'Добавьте овсяные хлопья и варите.' },
			{
				id: 3,
				order: 3,
				description: 'Положите нарезанный банан и добавьте мёд.',
			},
		],
		likesCount: 57,
		commentsCount: 8,
		isLikedByCurrentUser: true,
		isSavedByCurrentUser: false,
		viewsCount: 180,
		calories: 250,
		cookingTime: 10,
		comments: [],
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
		ingredients: [
			{ id: 1, name: 'Овсяные хлопья', quantity: '50 г' },
			{ id: 2, name: 'Банан', quantity: '1 шт.' },
			{ id: 3, name: 'Мёд', quantity: '1 ст. л.' },
		],
		recipeSteps: [
			{ id: 1, order: 1, description: 'Нагрейте молоко или воду.' },
			{ id: 2, order: 2, description: 'Добавьте овсяные хлопья и варите.' },
			{
				id: 3,
				order: 3,
				description: 'Положите нарезанный банан и добавьте мёд.',
			},
		],
		likesCount: 57,
		commentsCount: 8,
		isLikedByCurrentUser: true,
		isSavedByCurrentUser: false,
		viewsCount: 180,
		calories: 250,
		cookingTime: 10,
		comments: [],
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
		ingredients: [
			{ id: 1, name: 'Овсяные хлопья', quantity: '50 г' },
			{ id: 2, name: 'Банан', quantity: '1 шт.' },
			{ id: 3, name: 'Мёд', quantity: '1 ст. л.' },
		],
		recipeSteps: [
			{ id: 1, order: 1, description: 'Нагрейте молоко или воду.' },
			{ id: 2, order: 2, description: 'Добавьте овсяные хлопья и варите.' },
			{
				id: 3,
				order: 3,
				description: 'Положите нарезанный банан и добавьте мёд.',
			},
		],
		likesCount: 57,
		commentsCount: 8,
		isLikedByCurrentUser: true,
		isSavedByCurrentUser: false,
		viewsCount: 180,
		calories: 250,
		cookingTime: 10,
		comments: [],
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
		ingredients: [
			{ id: 1, name: 'Овсяные хлопья', quantity: '50 г' },
			{ id: 2, name: 'Банан', quantity: '1 шт.' },
			{ id: 3, name: 'Мёд', quantity: '1 ст. л.' },
		],
		recipeSteps: [
			{ id: 1, order: 1, description: 'Нагрейте молоко или воду.' },
			{ id: 2, order: 2, description: 'Добавьте овсяные хлопья и варите.' },
			{
				id: 3,
				order: 3,
				description: 'Положите нарезанный банан и добавьте мёд.',
			},
		],
		likesCount: 57,
		commentsCount: 8,
		isLikedByCurrentUser: true,
		isSavedByCurrentUser: false,
		viewsCount: 180,
		calories: 250,
		cookingTime: 10,
		comments: [],
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
		ingredients: [
			{ id: 1, name: 'Овсяные хлопья', quantity: '50 г' },
			{ id: 2, name: 'Банан', quantity: '1 шт.' },
			{ id: 3, name: 'Мёд', quantity: '1 ст. л.' },
		],
		recipeSteps: [
			{ id: 1, order: 1, description: 'Нагрейте молоко или воду.' },
			{ id: 2, order: 2, description: 'Добавьте овсяные хлопья и варите.' },
			{
				id: 3,
				order: 3,
				description: 'Положите нарезанный банан и добавьте мёд.',
			},
		],
		likesCount: 57,
		commentsCount: 8,
		isLikedByCurrentUser: true,
		isSavedByCurrentUser: false,
		viewsCount: 180,
		calories: 250,
		cookingTime: 10,
		comments: [],
	},

	{
		id: 7,
		title: 'Домашняя лазанья с соусом болоньезе',
		excerpt: 'Пошаговый рецепт вкуснейшей лазаньи с говядиной и сыром.',
		content: `1. Разогрейте духовку до 180°C.
	2. Обжарьте лук и чеснок до золотистого цвета...
	3. Добавьте мясо, затем томаты и тушите 20 минут...
	4. Соберите лазанью слоями и запекайте 40 минут.`,

		coverImage:
			'https://avatars.mds.yandex.net/i?id=a84e5844624042147acd0329e0d7c742_l-5163390-images-thumbs&n=13',
		createdAt: '2025-04-05T12:00:00Z',
		updatedAt: '2025-04-06T08:00:00Z',

		author: {
			id: 1,
			username: 'cooking_queen',
			displayName: 'Анна',
			avatarUrl:
				'https://sun9-32.userapi.com/impf/c630428/v630428764/19c7c/L9zMskqn_VM.jpg?size=604x403&quality=96&sign=1ed0bbeac00feced13a6eeba30a68c86&c_uniq_tag=kZEZQFm16Nr8dw3o8R-vZ4Z00JCYHgG7lTJPhtrulvs&type=album',
		},

		tags: [
			{ id: 1, name: 'Паста', slug: 'pasta' },
			{ id: 2, name: 'Ужин', slug: 'dinner' },
		],

		ingredients: [
			{ id: 1, name: 'Листы для лазаньи', quantity: '6 шт.' },
			{ id: 2, name: 'Говядина', quantity: '500 г' },
			{ id: 3, name: 'Сыр моцарелла', quantity: '200 г' },
		],

		recipeSteps: [
			{ id: 1, order: 1, description: 'Обжарьте лук и чеснок.' },
			{ id: 2, order: 2, description: 'Добавьте фарш и тушите с томатами.' },
			{ id: 3, order: 3, description: 'Соберите лазанью слоями.' },
			{ id: 4, order: 4, description: 'Выпекайте при 180°C 40 минут.' },
		],

		likesCount: 142,
		commentsCount: 3,
		isLikedByCurrentUser: true,
		isSavedByCurrentUser: false,

		viewsCount: 987,
		calories: 650,
		cookingTime: 90,

		comments: [
			{
				id: 1,
				author: {
					id: 2,
					username: 'foodie_lena',
					displayName: 'Лена',
					avatarUrl: '/avatars/lena.jpg',
				},
				content: 'Очень вкусно получилось, спасибо за рецепт!',
				createdAt: '2025-04-06T10:20:00Z',
			},
			{
				id: 2,
				author: {
					id: 3,
					username: 'chef_maks',
					displayName: 'Макс',
					avatarUrl: '/avatars/maks.jpg',
				},
				content: 'А можно заменить говядину на курицу?',
				createdAt: '2025-04-06T11:00:00Z',
			},
			{
				id: 3,
				author: {
					id: 2,
					username: 'foodie_lena',
					displayName: 'Лена',
					avatarUrl: '/avatars/lena.jpg',
				},
				content: 'Я пробовала с курицей – тоже супер!',
				createdAt: '2025-04-06T11:10:00Z',
				parentCommentId: 2,
			},
		],
	},
]
