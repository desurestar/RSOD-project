import { useCallback, useEffect, useRef, useState } from 'react'
import { blogAPI } from '../../../../api/blog'
import { Tag } from '../../../../api/types'
import { LoadingSpinner } from '../../../../components/LoadingSpinner/LoadingSpinner'
import styles from '../../AdminPanel.module.css'

const PAGE_SIZE = 8

export const AdminTags = () => {
	const [tags, setTags] = useState<Tag[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [debounced, setDebounced] = useState('')
	const [page, setPage] = useState(1)
	const [hasNext, setHasNext] = useState(true)
	const [initialLoading, setInitialLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [newTagName, setNewTagName] = useState('')
	const [newTagColor, setNewTagColor] = useState('#FF5733')
	const sentinelRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		const id = setTimeout(() => setDebounced(searchTerm), 500)
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
				const res = await blogAPI.getTagsPaginated({
					page: reset ? 1 : page,
					page_size: PAGE_SIZE,
					search: debounced || undefined,
				})
				const list = res.results
				if (reset) setTags(list)
				else setTags(prev => [...prev, ...list])
				setHasNext(Boolean(res.next))
				setPage(p => (reset ? 2 : p + 1))
			} catch {
				setError('Ошибка загрузки тегов')
			} finally {
				if (reset) setInitialLoading(false)
				setLoadingMore(false)
			}
		},
		[page, debounced, hasNext, loadingMore]
	)

	useEffect(() => {
		loadPage(true)
	}, [debounced]) // eslint-disable-line

	useEffect(() => {
		if (!sentinelRef.current) return
		const el = sentinelRef.current
		const obs = new IntersectionObserver(
			e => {
				if (e[0].isIntersecting) loadPage(false)
			},
			{ rootMargin: '250px' }
		)
		obs.observe(el)
		return () => obs.disconnect()
	}, [loadPage])

	const generateSlug = (name: string) =>
		name
			.toLowerCase()
			.replace(/\s+/g, '-')
			.replace(/[^\w-]+/g, '')

	const handleAddTag = async () => {
		if (!newTagName.trim()) return
		try {
			const created = await blogAPI.createTag({
				name: newTagName.trim(),
				slug: generateSlug(newTagName),
				color: newTagColor,
			})
			setTags(prev => [created, ...prev])
			setNewTagName('')
		} catch {
			/* ignore */
		}
	}

	const handleDeleteTag = async (id: number) => {
		try {
			await blogAPI.deleteTag(id)
			setTags(tags.filter(tag => tag.id !== id))
		} catch (err) {
			setError('Ошибка при удалении тега')
			console.error(err)
		}
	}

	if (initialLoading) return <LoadingSpinner />
	if (error) return <div className={styles.section}>{error}</div>

	return (
		<div className={styles.section}>
			<h2>Теги</h2>
			<div className={styles.actionsRow}>
				<input
					placeholder='Поиск'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					className={styles.searchInput}
				/>
				<div className={styles.inlineAdd}>
					<input
						placeholder='Новый тег'
						value={newTagName}
						onChange={e => setNewTagName(e.target.value)}
						className={styles.searchInput}
					/>
					<input
						type='color'
						value={newTagColor}
						onChange={e => setNewTagColor(e.target.value)}
					/>
					<button onClick={handleAddTag}>Добавить</button>
				</div>
			</div>
			<ul className={styles.list}>
				{tags.map(tag => {
					const color = tag.color
						? tag.color.startsWith('#')
							? tag.color
							: `#${tag.color}`
						: '#ddd'
					return (
						<li key={tag.id} className={styles.listItem}>
							<span
								style={{ backgroundColor: color }}
								className={styles.colorDot}
								title={color}
							/>
							<span>{tag.name}</span>
							<span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{color}</span>
							<button
								onClick={() => handleDeleteTag(tag.id)}
								className={styles.deleteButton}
							>
								Удалить
							</button>
						</li>
					)
				})}
				{!tags.length && (
					<li style={{ padding: 12, textAlign: 'center' }}>Нет данных</li>
				)}
			</ul>
			<div ref={sentinelRef} />
			{loadingMore && (
				<div style={{ padding: 12 }}>
					<LoadingSpinner />
				</div>
			)}
			{!hasNext && tags.length > 0 && (
				<p style={{ textAlign: 'center', opacity: 0.6 }}>Конец списка</p>
			)}
		</div>
	)
}
