import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Post, User } from '../../api/types'
import { userAPI } from '../../api/user'
import { PostsFeed } from '../../components/PostsFeed/PostsFeed'
import { useAuthStore } from '../../stores/authStore'
import styles from './UserPublicProfile.module.css'

export const UserPublicProfile: React.FC = () => {
	const { username } = useParams<{ username: string }>()
	const { user: me, isAuthenticated } = useAuthStore()
	const [profile, setProfile] = useState<User | null>(null)
	const [posts, setPosts] = useState<Post[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [search, setSearch] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [isSubscribed, setIsSubscribed] = useState(false)
	const requestIdRef = useRef(0)

	useEffect(() => {
		if (!username) return
		const currentReq = ++requestIdRef.current
		setLoading(true)
		setError(null)
		;(async () => {
			try {
				const u = await userAPI.getByUsername(username)
				if (requestIdRef.current !== currentReq) return
				setProfile(u)
				setIsSubscribed(!!u.is_subscribed)
				const userPosts = await userAPI.getUserPosts(u.id)
				if (requestIdRef.current !== currentReq) return
				setPosts(userPosts)
			} catch {
				if (requestIdRef.current === currentReq)
					setError('Не удалось загрузить профиль')
			} finally {
				if (requestIdRef.current === currentReq) setLoading(false)
			}
		})()
	}, [username])

	const filteredPosts = useMemo(
		() =>
			posts.filter(p => p.title.toLowerCase().includes(search.toLowerCase())),
		[posts, search]
	)

	const canSubscribe = !!(
		isAuthenticated &&
		profile &&
		me &&
		me.id !== profile.id
	)

	const handleToggleSubscribe = async () => {
		if (!profile || !canSubscribe || submitting) return
		setSubmitting(true)
		try {
			if (isSubscribed) {
				await userAPI.unfollow(profile.id)
				setIsSubscribed(false)
				setProfile(p =>
					p
						? { ...p, subscribers_count: Math.max(0, p.subscribers_count - 1) }
						: p
				)
			} else {
				await userAPI.follow(profile.id)
				setIsSubscribed(true)
				setProfile(p =>
					p ? { ...p, subscribers_count: p.subscribers_count + 1 } : p
				)
			}
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) return <div className={styles.loading}>Загрузка профиля...</div>
	if (error || !profile)
		return (
			<div className={styles.error}>{error || 'Пользователь не найден'}</div>
		)

	return (
		<div className={styles.profileContainer}>
			<div className={styles.profileHeader}>
				<div className={styles.avatarWrapper}>
					<img
						src={profile.avatar_url || '/default-avatar.png'}
						alt={profile.display_name || profile.username}
						className={styles.avatar}
					/>
				</div>
				<div className={styles.profileInfo}>
					<h1 className={styles.displayName}>
						{profile.display_name || profile.username}
					</h1>
					<p className={styles.username}>@{profile.username}</p>
					<p className={styles.email}>{profile.email}</p>
					<div className={styles.actions}>
						{canSubscribe && (
							<button
								className={styles.subscribeButton}
								disabled={submitting}
								onClick={handleToggleSubscribe}
							>
								{isSubscribed ? 'Отписаться' : 'Подписаться'}
							</button>
						)}
					</div>
				</div>
			</div>

			<div className={styles.statsContainer}>
				<div className={styles.statItem}>
					<span className={styles.statNumber}>
						{profile.subscribers_count ?? 0}
					</span>
					<span className={styles.statLabel}>Подписчики</span>
				</div>
				<div className={styles.statItem}>
					<span className={styles.statNumber}>
						{profile.subscriptions_count ?? 0}
					</span>
					<span className={styles.statLabel}>Подписки</span>
				</div>
			</div>

			<div className={styles.tabContent}>
				<h2 className={styles.tabTitle}>Посты пользователя ({posts.length})</h2>

				<input
					type='text'
					value={search}
					onChange={e => setSearch(e.target.value)}
					placeholder='Поиск по постам...'
					className={styles.searchInput}
				/>

				{filteredPosts.length === 0 ? (
					<div className={styles.emptyMessage}>Постов пока нет</div>
				) : (
					<PostsFeed posts={filteredPosts} />
				)}
			</div>
		</div>
	)
}
