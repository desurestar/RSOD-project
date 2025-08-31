import React, { useEffect, useMemo, useState } from 'react'
import { blogAPI } from '../../api/blog'
import { Post, Tag } from '../../api/types'
import { CreatePostButton } from '../../components/CreatePostButton/CreatePostButton'
import { FilterSidebar } from '../../components/FilterSidebar/FilterSidebar'
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner'
import { PostsFeed } from '../../components/PostsFeed/PostsFeed'
import styles from './HomePage.module.css'

export const HomePage: React.FC = () => {
	const [posts, setPosts] = useState<Post[]>([])
	const [allTags, setAllTags] = useState<Tag[]>([])
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [timeFilter, setTimeFilter] = useState<number | ''>('')
	const [caloriesFilter, setCaloriesFilter] = useState<number | ''>('')
	const [sortOption, setSortOption] = useState<'relevance' | 'likes' | 'views'>(
		'relevance'
	)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true)
				const [recipes, tags] = await Promise.all([
					blogAPI.getPosts({ post_type: 'recipe' }),
					blogAPI.getTags(),
				])
				setPosts(recipes)
				setAllTags(tags)
			} catch (e) {
				console.error(e)
				setError('Не удалось загрузить рецепты')
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	const filteredSorted = useMemo(() => {
		let result = posts.filter(p => {
			const tagMatch =
				selectedTags.length === 0 ||
				p.tags.some(t => selectedTags.includes(t.slug))
			const timeMatch =
				!timeFilter || (p.cooking_time ?? 0) <= Number(timeFilter)
			const calMatch =
				!caloriesFilter || (p.calories ?? 0) <= Number(caloriesFilter)
			return tagMatch && timeMatch && calMatch
		})
		result = result.sort((a, b) => {
			if (sortOption === 'likes') return b.likes_count - a.likes_count
			if (sortOption === 'views') return b.views_count - a.views_count
			const ra = a.tags.filter(t => selectedTags.includes(t.slug)).length
			const rb = b.tags.filter(t => selectedTags.includes(t.slug)).length
			return rb - ra
		})
		return result
	}, [posts, selectedTags, timeFilter, caloriesFilter, sortOption])

	if (loading) return <LoadingSpinner />
	if (error)
		return (
			<main className={styles.container}>
				<h1 className={styles.heading}>Лента рецептов</h1>
				<p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
			</main>
		)

	return (
		<main className={styles.container}>
			<h1 className={styles.heading}>Лента рецептов</h1>
			<div className={styles.content}>
				<div className={styles.posts}>
					<PostsFeed posts={filteredSorted} />
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
						recipeTags={allTags.map(t => ({ ...t, color: t.color || '' }))}
					/>
				</div>
			</div>
		</main>
	)
}
