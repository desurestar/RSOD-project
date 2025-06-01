import React, { useState } from 'react'
import { CreatePostButton } from '../../components/CreatePostButton/CreatePostButton'
import { FilterSidebar } from '../../components/FilterSidebar/FilterSidebar'
import { Footer } from '../../components/Footer/Footer'
import { Header } from '../../components/Heared/Header'
import { PostsFeed } from '../../components/PostsFeed/PostsFeed'
import { mockPosts } from '../../mock/mockData'
import { recipeTags } from '../../mock/mockTags'
import styles from './HomePage.module.css'

export const HomePage: React.FC = () => {
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [timeFilter, setTimeFilter] = useState<number | ''>('')
	const [caloriesFilter, setCaloriesFilter] = useState<number | ''>('')
	const [sortOption, setSortOption] = useState<'relevance' | 'likes' | 'views'>(
		'relevance'
	)

	// Фильтрация постов
	let posts = mockPosts.filter(post => {
		const tagMatch =
			selectedTags.length === 0 ||
			post.tags.some(t => selectedTags.includes(t.slug))
		const timeMatch =
			!timeFilter || (post.cookingTime ?? 0) <= Number(timeFilter)
		const calMatch =
			!caloriesFilter || (post.calories ?? 0) <= Number(caloriesFilter)
		return tagMatch && timeMatch && calMatch
	})

	posts = posts.sort((a, b) => {
		if (sortOption === 'likes') return b.likesCount - a.likesCount
		if (sortOption === 'views') return b.viewsCount - a.viewsCount

		const ra = a.tags.filter(t => selectedTags.includes(t.slug)).length
		const rb = b.tags.filter(t => selectedTags.includes(t.slug)).length
		return rb - ra
	})

	return (
		<>
			<Header />
			<main className={styles.container}>
				<h1 className={styles.heading}>Лента рецептов</h1>
				<div className={styles.content}>
					<div className={styles.posts}>
						<PostsFeed posts={posts} />
					</div>
					<div className={styles.sidebar}>
						<CreatePostButton />
						<FilterSidebar
							selectedTags={selectedTags}
							setSelectedTags={setSelectedTags}
							timeFilter={timeFilter}
							setTimeFilter={setTimeFilter}
							caloriesFilter={caloriesFilter}
							setCaloriesFilter={setCaloriesFilter}
							sortOption={sortOption}
							setSortOption={setSortOption}
							recipeTags={recipeTags.map(tag => ({
								...tag,
								color: tag.color || '',
							}))}
						/>
					</div>
				</div>
			</main>
			<Footer />
		</>
	)
}
