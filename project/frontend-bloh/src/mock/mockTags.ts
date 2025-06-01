import { Tag } from '../types/post.types'

export const recipeTags: Tag[] = [
	{ id: 1, name: 'Завтрак', slug: 'zavtrak', color: '#FFB74D' },
	{ id: 2, name: 'Обед', slug: 'obed', color: '#4DB6AC' },
	{ id: 3, name: 'Ужин', slug: 'uzhin', color: '#7986CB' },
	{ id: 4, name: 'Десерты', slug: 'deserty', color: '#F06292' },
	{ id: 5, name: 'Выпечка', slug: 'vypechka', color: '#A1887F' },
	{ id: 6, name: 'Вегетарианское', slug: 'vegetarianskoe', color: '#81C784' },
	{ id: 7, name: 'Низкокалорийное', slug: 'nizkokaloriynoe', color: '#AED581' },
	{ id: 8, name: 'Быстро и просто', slug: 'bystro-i-prosto', color: '#4FC3F7' },
	{ id: 9, name: 'Сезонное', slug: 'sezonnoe', color: '#FF8A65' },
	{ id: 10, name: 'Праздничное', slug: 'prazdnichnoe', color: '#BA68C8' },
]

export const articleTags: Tag[] = [
	{
		id: 1,
		name: 'Советы по питанию',
		slug: 'sovety-po-pitaniyu',
		color: '#FFB74D',
	},
	{
		id: 2,
		name: 'Продукты и ингредиенты',
		slug: 'produkty-i-ingredienty',
		color: '#4DB6AC',
	},
	{ id: 3, name: 'ЗОЖ', slug: 'zozh', color: '#81C784' },
	{ id: 4, name: 'История блюд', slug: 'istoriya-blyud', color: '#7986CB' },
	{ id: 5, name: 'Кухни мира', slug: 'kuhni-mira', color: '#BA68C8' },
	{
		id: 6,
		name: 'Кулинарные лайфхаки',
		slug: 'kulinarnye-layfhaki',
		color: '#F06292',
	},
	{ id: 7, name: 'Тренды', slug: 'trendy', color: '#4FC3F7' },
	{
		id: 8,
		name: 'Фермерские продукты',
		slug: 'fermerskie-produkty',
		color: '#AED581',
	},
]
