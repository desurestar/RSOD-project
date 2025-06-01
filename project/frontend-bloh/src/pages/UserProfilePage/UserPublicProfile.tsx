import React, { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Footer } from '../../components/Footer/Footer'
import { Header } from '../../components/Heared/Header'
import { mockPosts } from '../../mock/mockData'
import { mockUsers } from '../../mock/mockUser'
import { User } from '../../types/auth.types'
import { Post } from '../../types/post.types'
import styles from './UserPublicProfile.module.css'

export const UserPublicProfile: React.FC = () => {
	const { username } = useParams<{ username: string }>()
	const [search, setSearch] = useState('')
	const [isSubscribed, setIsSubscribed] = useState(false) // ⬅️ Новое

	const user: User | undefined = mockUsers.find(u => u.username === username)
	const userPosts: Post[] = mockPosts.filter(
		post => post.author.username === username
	)

	const filteredPosts = useMemo(() => {
		return userPosts.filter(post =>
			post.title.toLowerCase().includes(search.toLowerCase())
		)
	}, [search, userPosts])

	if (!user) return <p>Пользователь не найден</p>

	const handleToggleSubscribe = () => {
		setIsSubscribed(prev => !prev)
		// тут можно вызвать API-запрос
	}

	return (
		<div className={styles.pageContainer}>
			<Header />
			<div className={styles.wrapper}>
				<div className={styles.header}>
					<img
						src={user.avatarUrl}
						alt={user.displayName || user.username}
						className={styles.avatar}
					/>
					<div className={styles.info}>
						<h1>{user.displayName || user.username}</h1>
						<span className={styles.username}>@{user.username}</span>
						{user.email && <p className={styles.bio}>{user.email}</p>}
						<div className={styles.stats}>
							<span>Постов: {user.postsCount || 0}</span>
							<span>Подписчики: {user.subscribersCount || 0}</span>
							<span>Подписки: {user.subscriptionsCount || 0}</span>
						</div>
					</div>

					{/* 👇 Кнопка подписки */}
					<button
						className={styles.subscribeButton}
						onClick={handleToggleSubscribe}
					>
						{isSubscribed ? 'Отписаться' : 'Подписаться'}
					</button>
				</div>

				<h2 className={styles.postsTitle}>Посты</h2>

				<input
					type='text'
					value={search}
					onChange={e => setSearch(e.target.value)}
					className={styles.searchInput}
					placeholder='Поиск по постам...'
				/>

				{filteredPosts.length > 0 ? (
					<div className={styles.postsGrid}>
						{filteredPosts.map(post => (
							<div key={post.id} className={styles.postCard}>
								<img
									src={post.coverImage}
									alt={post.title}
									className={styles.postImage}
								/>
								<h3>{post.title}</h3>
								<p>{post.excerpt}</p>
							</div>
						))}
					</div>
				) : (
					<p className={styles.noPosts}>Постов пока нет.</p>
				)}
			</div>
			<Footer className={styles.footer} />
		</div>
	)
}
