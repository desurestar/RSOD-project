import React from 'react'
import { Link } from 'react-router-dom'
import { User } from '../../types/auth.types'
import styles from './UserCardMini.module.css'

interface Props {
	user: User
	onUnsubscribe?: (id: number) => void
}

export const UserCardMini: React.FC<Props> = ({ user, onUnsubscribe }) => {
	return (
		<div className={styles.card}>
			<Link to={`/profile/${user.username}`} className={styles.userLink}>
				<img
					src={user.avatarUrl}
					alt={user.username}
					className={styles.avatar}
				/>
				<div className={styles.info}>
					<span className={styles.name}>
						{user.displayName || user.username}
					</span>
					<span className={styles.username}>@{user.username}</span>
				</div>
			</Link>
			{onUnsubscribe && (
				<button
					className={styles.unsubscribeButton}
					onClick={() => onUnsubscribe(user.id)}
				>
					Отписаться
				</button>
			)}
		</div>
	)
}
