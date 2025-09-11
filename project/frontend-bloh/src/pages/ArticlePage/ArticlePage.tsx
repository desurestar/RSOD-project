import React, { useCallback, useEffect, useRef, useState } from 'react'
import { blogAPI } from '../../api/blog'
import { Post } from '../../api/types'
import { CreatePostButton } from '../../components/CreatePostButton/CreatePostButton'
import { FilterSidebarForArticle } from '../../components/FilterSidebarForArticle/FilterSidebarForArticle'
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner'
import { PostsFeed } from '../../components/PostsFeed/PostsFeed'
import styles from './ArticlePage.module.css'

export const ArticlePage: React.FC = () => {
	const [posts, setPosts] = useState<Post[]>([])
	const [loadingInitial, setLoadingInitial] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [sortOption, setSortOption] = useState<'relevance' | 'likes' | 'views'>(
		'relevance'
	)

	const [page, setPage] = useState(1)
	const [hasNext, setHasNext] = useState(true)
	const sentinelRef = useRef<HTMLDivElement | null>(null)
	const PAGE_SIZE = 4

	const ordering = () =>
		sortOption === 'likes'
			? '-likes'
			: sortOption === 'views'
			? '-views'
			: '-created_at'

	const loadPage = useCallback(
		async (reset = false) => {
			if (reset) {
				setLoadingInitial(true)
				setPage(1)
				setHasNext(true)
			} else {
				if (!hasNext || loadingMore) return
				setLoadingMore(true)
			}
			try {
				const res = await blogAPI.queryPosts({
					post_type: 'article',
					page: reset ? 1 : page,
					page_size: PAGE_SIZE,
					ordering: ordering(),
				})
				if (reset) setPosts(res.results)
				else setPosts(prev => [...prev, ...res.results])
				setHasNext(Boolean(res.next))
				setPage(p => (reset ? 2 : p + 1))
			} catch {
				setError('Не удалось загрузить статьи')
			} finally {
				if (reset) setLoadingInitial(false)
				setLoadingMore(false)
			}
		},
		[page, sortOption, hasNext, loadingMore]
	)

	useEffect(() => {
		loadPage(true)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		loadPage(true)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sortOption])

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

	if (loadingInitial) return <LoadingSpinner />
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
					<PostsFeed posts={posts} />
					<div ref={sentinelRef} />
					{loadingMore && (
						<div style={{ padding: 16 }}>
							<LoadingSpinner />
						</div>
					)}
					{!hasNext && posts.length > 0 && (
						<p style={{ textAlign: 'center', opacity: 0.6, margin: 16 }}>
							Больше статей нет
						</p>
					)}
				</div>
				<div className={styles.sidebar}>
					<CreatePostButton />
					<FilterSidebarForArticle
						sortOption={sortOption}
						setSortOption={setSortOption}
					/>
				</div>
			</div>
		</main>
	)
}
