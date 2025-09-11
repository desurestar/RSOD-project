import React, { useCallback, useEffect, useRef, useState } from 'react'
import { blogAPI } from '../../api/blog'
import { Post } from '../../api/types'
import { CreatePostButton } from '../../components/CreatePostButton/CreatePostButton'
import { FilterSidebar } from '../../components/FilterSidebar/FilterSidebar'
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner'
import { PostsFeed } from '../../components/PostsFeed/PostsFeed'
import styles from './HomePage.module.css'

export const HomePage: React.FC = () => {
	const [posts, setPosts] = useState<Post[]>([])
	const [timeFilter, setTimeFilter] = useState<number | ''>('')
	const [caloriesFilter, setCaloriesFilter] = useState<number | ''>('')
	const [sortOption, setSortOption] = useState<'relevance' | 'likes' | 'views'>(
		'relevance'
	)

	const [page, setPage] = useState(1)
	const [hasNext, setHasNext] = useState(true)
	const [initialLoading, setInitialLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const sentinelRef = useRef<HTMLDivElement | null>(null)
	const PAGE_SIZE = 4

	const buildOrdering = () => {
		if (sortOption === 'likes') return '-likes'
		if (sortOption === 'views') return '-views'
		return '-created_at' // бывшая "relevance"
	}

	const loadPage = useCallback(
		async (reset = false) => {
			if (reset) {
				setInitialLoading(true)
				setPage(1)
				setHasNext(true)
			} else {
				if (!hasNext || loadingMore) return
				setLoadingMore(true)
			}
			try {
				const res = await blogAPI.queryPosts({
					post_type: 'recipe',
					page: reset ? 1 : page,
					page_size: PAGE_SIZE,
					max_time: timeFilter || undefined,
					max_calories: caloriesFilter || undefined,
					ordering: buildOrdering(),
				})
				if (reset) {
					setPosts(res.results)
				} else {
					setPosts(prev => [...prev, ...res.results])
				}
				setHasNext(Boolean(res.next))
				setPage(p => (reset ? 2 : p + 1))
			} catch {
				setError('Не удалось загрузить рецепты')
			} finally {
				if (reset) setInitialLoading(false)
				setLoadingMore(false)
			}
		},
		[page, timeFilter, caloriesFilter, sortOption, hasNext, loadingMore]
	)

	useEffect(() => {
		loadPage(true)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		loadPage(true)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timeFilter, caloriesFilter, sortOption])

	useEffect(() => {
		if (!sentinelRef.current) return
		const el = sentinelRef.current
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting) loadPage(false)
			},
			{ rootMargin: '200px' }
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [loadPage])

	if (initialLoading) return <LoadingSpinner />
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
					<PostsFeed posts={posts} />
					<div ref={sentinelRef} />
					{loadingMore && (
						<div style={{ padding: 16 }}>
							<LoadingSpinner />
						</div>
					)}
					{!hasNext && posts.length > 0 && (
						<p style={{ textAlign: 'center', opacity: 0.6, margin: 16 }}>
							Больше рецептов нет
						</p>
					)}
				</div>
				<div className={styles.sidebar}>
					<CreatePostButton />
					<FilterSidebar
						timeFilter={timeFilter}
						setTimeFilter={setTimeFilter}
						caloriesFilter={caloriesFilter}
						setCaloriesFilter={setCaloriesFilter}
						sortOption={sortOption}
						setSortOption={setSortOption}
					/>
				</div>
			</div>
		</main>
	)
}
