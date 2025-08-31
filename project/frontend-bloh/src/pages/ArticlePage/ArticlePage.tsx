import React, { useEffect, useMemo, useState } from 'react'
import { blogAPI } from '../../api/blog'
import { Post, Tag } from '../../api/types'
import { CreatePostButton } from '../../components/CreatePostButton/CreatePostButton'
import { FilterSidebarForArticle } from '../../components/FilterSidebarForArticle/FilterSidebarForArticle'
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner'
import { PostsFeed } from '../../components/PostsFeed/PostsFeed'
import styles from './ArticlePage.module.css'

export const ArticlePage: React.FC = () => {
	const [posts, setPosts] = useState<Post[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [allTags, setAllTags] = useState<Tag[]>([])
	const [selectedTags, setSelectedTags] = useState<string[]>([])
	const [sortOption, setSortOption] = useState<'relevance' | 'likes' | 'views'>(
		'relevance'
	)

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true)
				const [articles, tags] = await Promise.all([
					blogAPI.getPosts({ post_type: 'article' }),
					blogAPI.getTags(),
				])
				setPosts(articles)
				setAllTags(tags)
			} catch (e) {
				console.error(e)
				setError('Не удалось загрузить статьи')
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
			return tagMatch
		})

		result = result.sort((a, b) => {
			if (sortOption === 'likes') return b.likes_count - a.likes_count
			if (sortOption === 'views') return b.views_count - a.views_count
			// relevance
			const ra = a.tags.filter(t => selectedTags.includes(t.slug)).length
			const rb = b.tags.filter(t => selectedTags.includes(t.slug)).length
			return rb - ra
		})
		return result
	}, [posts, selectedTags, sortOption])

	if (loading) return <LoadingSpinner />
	if (error)
		return (
			<main className={styles.container}>
				<h1 className={styles.heading}>Статьи</h1>
				<p style={{ textAlign: 'center', color: 'red' }}>{error}</p>
			</main>
		)

	return (
		<main className={styles.container}>
			<h1 className={styles.heading}>Статьи</h1>
			<div className={styles.content}>
				<div className={styles.posts}>
					<PostsFeed posts={filteredSorted} />
				</div>
				<div className={styles.sidebar}>
					<CreatePostButton />
					<FilterSidebarForArticle
						selectedTags={selectedTags}
						setSelectedTags={setSelectedTags}
						sortOption={sortOption}
						setSortOption={setSortOption}
						recipeTags={allTags.map(t => ({
							...t,
							color: t.color || '',
						}))}
					/>
				</div>
			</div>
		</main>
	)
}
