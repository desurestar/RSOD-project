import { useCallback, useEffect, useRef, useState } from 'react'
import { authAPI } from '../../../../api/auth'
import { User } from '../../../../api/types'
import { LoadingSpinner } from '../../../../components/LoadingSpinner/LoadingSpinner'
import styles from '../../AdminPanel.module.css'

const PAGE_SIZE = 8

export const AdminUsers = () => {
	const [users, setUsers] = useState<User[]>([])
	const [searchTerm, setSearchTerm] = useState('')
	const [debounced, setDebounced] = useState('')
	const [page, setPage] = useState(1)
	const [hasNext, setHasNext] = useState(true)
	const [initialLoading, setInitialLoading] = useState(true)
	const [loadingMore, setLoadingMore] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const sentinelRef = useRef<HTMLDivElement | null>(null)

	// Добавлено: действия над пользователем
	const toggleAdminStatus = async (userId: number, isAdmin: boolean) => {
		const prev = users
		// оптимистично
		setUsers(p =>
			p.map(u => (u.id === userId ? { ...u, is_admin: isAdmin } : u))
		)
		try {
			const updated = await authAPI.updateAdminUser(userId, {
				role: isAdmin ? 'admin' : 'user',
			})
			setUsers(p => p.map(u => (u.id === userId ? { ...u, ...updated } : u)))
		} catch {
			setUsers(prev) // откат
			setError('Не удалось обновить статус пользователя')
		}
	}

	const handleDeleteUser = async (userId: number) => {
		if (!window.confirm('Удалить пользователя? Это действие необратимо.'))
			return
		const prev = users
		setUsers(p => p.filter(u => u.id !== userId))
		try {
			await authAPI.deleteAdminUser(userId)
		} catch {
			setError('Ошибка удаления пользователя')
			setUsers(prev) // откат
		}
	}

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
				const res = await authAPI.getAdminUsers({
					page: reset ? 1 : page,
					page_size: PAGE_SIZE,
					search: debounced || undefined,
				})
				const list = res.results ?? res
				if (reset) setUsers(list)
				else setUsers(prev => [...prev, ...list])
				setHasNext(Boolean(res.next))
				setPage(p => (reset ? 2 : p + 1))
			} catch {
				setError('Ошибка загрузки пользователей')
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
			{ rootMargin: '300px' }
		)
		obs.observe(el)
		return () => obs.disconnect()
	}, [loadPage])

	if (initialLoading) return <LoadingSpinner />
	if (error) return <div className={styles.section}>{error}</div>

	return (
		<div className={styles.section}>
			<h2>Пользователи</h2>
			<input
				placeholder='Поиск (username / email)'
				value={searchTerm}
				onChange={e => setSearchTerm(e.target.value)}
				className={styles.searchInput}
			/>
			<div className={styles.tableContainer}>
				<table className={styles.table}>
					<thead>
						<tr>
							<th>ID</th>
							<th>Имя</th>
							<th>Email</th>
							<th>Аватар</th>
							<th>Админ</th>
							<th>Действия</th>
						</tr>
					</thead>
					<tbody>
						{users.map(user => (
							<tr key={user.id}>
								<td>{user.id}</td>
								<td>
									<div className={styles.userCell}>
										{user.avatar_url && (
											<img
												src={user.avatar_url}
												alt={user.username}
												className={styles.avatar}
											/>
										)}
										<div>
											<div>{user.username}</div>
											{user.display_name && (
												<div className={styles.displayName}>
													{user.display_name}
												</div>
											)}
										</div>
									</div>
								</td>
								<td>{user.email}</td>
								<td>
									{user.avatar_url ? (
										<img
											src={user.avatar_url}
											alt='Аватар'
											className={styles.smallAvatar}
										/>
									) : (
										'Нет'
									)}
								</td>
								<td>
									<input
										type='checkbox'
										checked={user.is_admin}
										onChange={e => toggleAdminStatus(user.id, e.target.checked)}
										className={styles.checkbox}
									/>
								</td>
								<td>
									<button
										onClick={() => handleDeleteUser(user.id)}
										className={styles.deleteButton}
									>
										Удалить
									</button>
								</td>
							</tr>
						))}
						{!users.length && (
							<tr>
								<td colSpan={6} style={{ textAlign: 'center', padding: 24 }}>
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
				{!hasNext && users.length > 0 && (
					<p style={{ textAlign: 'center', opacity: 0.6 }}>Конец списка</p>
				)}
			</div>
		</div>
	)
}
