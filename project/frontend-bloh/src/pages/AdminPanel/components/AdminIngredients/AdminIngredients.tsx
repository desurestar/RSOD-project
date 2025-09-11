import { useCallback, useEffect, useRef, useState } from 'react'
import { blogAPI } from '../../../../api/blog'
import { Ingredient } from '../../../../api/types'
import { LoadingSpinner } from '../../../../components/LoadingSpinner/LoadingSpinner'
import styles from '../../AdminPanel.module.css'

const PAGE_SIZE = 8

export const AdminIngredients = () => {
	const [ingredients, setIngredients] = useState<Ingredient[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [debounced, setDebounced] = useState('')
	const [page, setPage] = useState(1)
	const [hasNext, setHasNext] = useState(true)
	const [initialLoading, setInitialLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [newIngredientName, setNewIngredientName] = useState('')
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
				const res = await blogAPI.getIngredients({
					page: reset ? 1 : page,
					page_size: PAGE_SIZE,
					search: debounced || undefined,
				})
				const list = res.results ?? res
				if (reset) setIngredients(list)
				else setIngredients(prev => [...prev, ...list])
				setHasNext(Boolean(res.next))
				setPage(p => (reset ? 2 : p + 1))
			} catch {
				setError('Ошибка загрузки ингредиентов')
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

	const handleAddIngredient = async () => {
		if (!newIngredientName.trim()) return
		try {
			const created = await blogAPI.createIngredient({
				name: newIngredientName.trim(),
			})
			setIngredients(prev => [created, ...prev])
			setNewIngredientName('')
		} catch {
			/* ignore */
		}
	}

	const handleDeleteIngredient = async (id: number) => {
		try {
			await blogAPI.deleteIngredient(id)
			setIngredients(prev => prev.filter(i => i.id !== id))
		} catch (e) {
			setError('Ошибка при удалении ингредиента')
			console.error(e)
		}
	}

	if (initialLoading) return <LoadingSpinner />
	if (error) return <div className={styles.section}>{error}</div>

	return (
		<div className={styles.section}>
			<h2>Ингредиенты</h2>
			<div className={styles.actionsRow}>
				<input
					placeholder='Поиск'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					className={styles.searchInput}
				/>
				<div className={styles.inlineAdd}>
					<input
						placeholder='Новый ингредиент'
						value={newIngredientName}
						onChange={e => setNewIngredientName(e.target.value)}
						className={styles.searchInput}
					/>
					<button onClick={handleAddIngredient}>Добавить</button>
				</div>
			</div>
			<ul className={styles.list}>
				{ingredients.map(i => (
					<li key={i.id} className={styles.listItem}>
						<span>{i.name}</span>
						<button
							onClick={() => handleDeleteIngredient(i.id)}
							className={styles.deleteButton}
						>
							Удалить
						</button>
					</li>
				))}
				{!ingredients.length && (
					<li style={{ padding: 12, textAlign: 'center' }}>Нет данных</li>
				)}
			</ul>
			<div ref={sentinelRef} />
			{loadingMore && (
				<div style={{ padding: 12 }}>
					<LoadingSpinner />
				</div>
			)}
			{!hasNext && ingredients.length > 0 && (
				<p style={{ textAlign: 'center', opacity: 0.6 }}>Конец списка</p>
			)}
		</div>
	)
}
