import React, { useState } from 'react'
import { Footer } from '../../components/Footer/Footer'
import { Header } from '../../components/Heared/Header'
import { UserCardMini } from '../../components/UserCardMini/UserCardMini'
import { mockUsers } from '../../mock/mockUser'
import styles from './SubscriptionsPage.module.css'

export const SubscriptionsPage: React.FC = () => {
	const [subscriptions, setSubscriptions] = useState(mockUsers.slice(0, 5))
	const [searchTerm, setSearchTerm] = useState('')

	const handleUnsubscribe = (id: number) => {
		setSubscriptions(prev => prev.filter(user => user.id !== id))
	}

	const filtered = subscriptions.filter(user =>
		(user.displayName || user.username)
			.toLowerCase()
			.includes(searchTerm.toLowerCase())
	)

	return (
		<div className={styles.pageContainer}>
			<Header />
			<main className={styles.main}>
				<h1>Мои подписки</h1>
				<input
					type='text'
					className={styles.searchInput}
					placeholder='Поиск по подпискам...'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
				/>
				{filtered.length === 0 ? (
					<p>Нет подписок по вашему запросу.</p>
				) : (
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
			<Footer className={styles.footer} />
		</div>
	)
}
