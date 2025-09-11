import { useCallback, useEffect, useRef, useState } from 'react'
import { blogAPI } from '../../../../api/blog'
import { Post } from '../../../../api/types'
import { LoadingSpinner } from '../../../../components/LoadingSpinner/LoadingSpinner'
import { PostEditModal } from '../../../../components/Modals/PostEditModal/PostEditModal'
import styles from '../../AdminPanel.module.css'

const PAGE_SIZE = 8

export const AdminPosts = () => {
	const [posts, setPosts] = useState<Post[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [debounced, setDebounced] = useState('')
	const [page, setPage] = useState(1)
	const [hasNext, setHasNext] = useState(true)
	const [initialLoading, setInitialLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [editingPost, setEditingPost] = useState<Post | null>(null)
	const [showEditModal, setShowEditModal] = useState(false)
	const sentinelRef = useRef<HTMLDivElement | null>(null)

	// debounce
	useEffect(() => {
		const id = setTimeout(() => setDebounced(searchTerm), 600)
		return () => clearTimeout(id)
	}, [searchTerm])

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
				const res = await blogAPI.getAdminPosts({
					page: reset ? 1 : page,
					page_size: PAGE_SIZE,
					search: debounced || undefined,
				})
				const list = res.results
				if (reset) setPosts(list)
				else setPosts(prev => [...prev, ...list])
				setHasNext(Boolean(res.next))
				setPage(p => (reset ? 2 : p + 1))
			} catch {
				setError('Ошибка загрузки постов')
			} finally {
				if (reset) setInitialLoading(false)
				setLoadingMore(false)
			}
		},
		[page, debounced, hasNext, loadingMore]
	)

	// initial + search reset
	useEffect(() => {
		loadPage(true)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debounced])

	// infinite scroll
	useEffect(() => {
		if (!sentinelRef.current) return
		const el = sentinelRef.current
		const observer = new IntersectionObserver(
			entries => {
				if (entries[0].isIntersecting) loadPage(false)
			},
			{ rootMargin: '300px' }
		)
		observer.observe(el)
		return () => observer.disconnect()
	}, [loadPage])

	const handleUpdateStatus = async (id: number, status: string) => {
		try {
			const updatedPost = await blogAPI.updatePostStatus(id, status)
			setPosts(posts.map(post => (post.id === id ? updatedPost : post)))
		} catch (err) {
			setError('Ошибка при обновлении статуса')
			console.error(err)
		}
	}

	const handleDeletePost = async (id: number) => {
		if (!confirm('Вы уверены, что хотите удалить этот пост?')) return
		try {
			await blogAPI.deletePost(id)
			setPosts(posts.filter(post => post.id !== id))
		} catch (err) {
			setError('Ошибка при удалении поста')
			console.error(err)
		}
	}

	const handleSavePost = async (updatedPost: Post) => {
		setPosts(
			posts.map(post => (post.id === updatedPost.id ? updatedPost : post))
		)
		setShowEditModal(false)
	}

	// Блокируем прокрутку body при открытом модальном окне
	useEffect(() => {
		if (showEditModal) {
			const prev = document.body.style.overflow
			document.body.style.overflow = 'hidden'
			return () => {
				document.body.style.overflow = prev
			}
		}
	}, [showEditModal])

	if (initialLoading) return <LoadingSpinner />
	if (error) return <div className={styles.section}>{error}</div>

	return (
		<div className={styles.section}>
			<h2>Управление постами</h2>
			<input
				placeholder='Поиск (заголовок / автор / тег)'
				value={searchTerm}
				onChange={e => setSearchTerm(e.target.value)}
				className={styles.searchInput}
			/>
			<div className={styles.tableContainer}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>ID</th>
							<th>Заголовок</th>
							<th>Автор</th>
							<th>Тип</th>
							<th>Статус</th>
							<th>Дата</th>
							<th>Действия</th>
						</tr>
					</thead>
					<tbody>
						{posts.map(post => (
							<tr key={post.id}>
								<td>{post.id}</td>
								<td>
									<div className={styles.postTitle}>
										{post.cover_image && (
											<img
												src={post.cover_image}
												alt={post.title}
												className={styles.postThumbnail}
											/>
										)}
										{post.title}
									</div>
								</td>
								<td>{post.author.username}</td>
								<td>{post.post_type === 'recipe' ? 'Рецепт' : 'Статья'}</td>
								<td>
									<select
										value={post.status}
										onChange={e => handleUpdateStatus(post.id, e.target.value)}
										className={styles.statusSelect}
										data-status={post.status}
									>
										<option value='draft'>Черновик</option>
										<option value='published'>Опубликован</option>
										<option value='archived'>Архив</option>
									</select>
								</td>
								<td>{new Date(post.created_at).toLocaleDateString()}</td>
								<td>
									<div className={styles.actions}>
										<button
											onClick={() => {
												setEditingPost(post)
												setShowEditModal(true)
											}}
											className={styles.editButton}
										>
											✏️
											<span style={{ letterSpacing: '.4px' }}>Редакт.</span>
										</button>
										<button
											onClick={() => handleDeletePost(post.id)}
											className={styles.deleteButton}
										>
											🗑
											<span style={{ letterSpacing: '.4px' }}>Удалить</span>
										</button>
									</div>
								</td>
							</tr>
						))}
						{!posts.length && (
							<tr>
								<td colSpan={7} style={{ textAlign: 'center', padding: 24 }}>
									Нет данных
								</td>
							</tr>
						)}
					</tbody>
				</table>
				<div ref={sentinelRef} />
				{loadingMore && (
					<div style={{ padding: 16 }}>
						<LoadingSpinner />
					</div>
				)}
				{!hasNext && posts.length > 0 && (
					<p style={{ textAlign: 'center', opacity: 0.6 }}>Конец списка</p>
				)}
			</div>
			{showEditModal && editingPost && (
				<PostEditModal
					post={editingPost}
					onClose={() => setShowEditModal(false)}
					onSave={handleSavePost}
				/>
			)}
		</div>
	)
}
