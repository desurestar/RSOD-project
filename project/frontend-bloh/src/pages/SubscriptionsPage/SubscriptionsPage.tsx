import React, { useEffect, useMemo, useState } from 'react'
import { User } from '../../api/types'
import { userAPI } from '../../api/user'
import { UserCardMini } from '../../components/UserCardMini/UserCardMini'
import { useAuthStore } from '../../stores/authStore'
import styles from './SubscriptionsPage.module.css'

export const SubscriptionsPage: React.FC = () => {
	const authUser = useAuthStore(s => s.user)
	const [subs, setSubs] = useState<User[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [searchTerm, setSearchTerm] = useState('')

	useEffect(() => {
		if (!authUser) return
		let cancelled = false
		;(async () => {
			setLoading(true)
			setError(null)
			try {
				const list = await userAPI.getSubscriptions(authUser.id)
				if (!cancelled) setSubs(list)
			} catch (e) {
				if (!cancelled) setError('Не удалось загрузить подписки')
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [authUser])

	const handleUnsubscribe = async (id: number) => {
		// оптимистично
		const prev = subs
		setSubs(s => s.filter(u => u.id !== id))
		try {
			await userAPI.unsubscribe(id)
		} catch (e) {
			setSubs(prev) // откат
		}
	}

	const filtered = useMemo(() => {
		const term = searchTerm.trim().toLowerCase()
		if (!term) return subs
		return subs.filter(u =>
			(u.display_name || u.username || '').toLowerCase().includes(term)
		)
	}, [subs, searchTerm])

	return (
		<div className={styles.pageContainer}>
			<main className={styles.main}>
				<h1>Мои подписки</h1>

				<input
					type='text'
					className={styles.searchInput}
					placeholder='Поиск по подпискам...'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					disabled={loading}
				/>

				{loading && <p style={{ opacity: 0.7 }}>Загрузка...</p>}
				{error && <p style={{ color: 'crimson' }}>{error}</p>}

				{!loading && !error && filtered.length === 0 && (
					<p>Нет подписок{searchTerm ? ' по вашему запросу' : ''}.</p>
				)}

				{!loading && !error && filtered.length > 0 && (
					<div className={styles.grid}>
						{filtered.map(user => (
							<UserCardMini
								key={user.id}
								user={user}
								onUnsubscribe={handleUnsubscribe}
							/>
						))}
					</div>
				)}
			</main>
		</div>
	)
}
