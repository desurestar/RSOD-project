import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../../api/auth'
import { Post, User } from '../../api/types'
import { MiniPostCard } from '../../components/MiniPostCard/MiniPostCard'
import { UserCardMini } from '../../components/UserCardMini/UserCardMini'
import { useAuthStore } from '../../stores/authStore'
import { useBlogStore } from '../../stores/blogStore' // Добавлен импорт blogStore
import styles from './Profile.module.css'

export const Profile: React.FC = () => {
	const {
		user,
		isAuthenticated,
		fetchProfile,
		loading: authLoading,
		error: authError,
	} = useAuthStore()

	const { posts } = useBlogStore() // Используем posts из blogStore

	const [activeTab, setActiveTab] = useState<
		'followers' | 'following' | 'posts' | 'liked' | null
	>(null)
	const [tabData, setTabData] = useState<(Post | User)[]>([])
	const [tabLoading, setTabLoading] = useState(false)
	const [tabError, setTabError] = useState<string | null>(null)

	// Загрузка профиля при монтировании
	useEffect(() => {
		const loadData = async () => {
			if (isAuthenticated) {
				await fetchProfile()
			}
		}
		loadData()
	}, [isAuthenticated, fetchProfile])

	// Загрузка данных для активной вкладки
	useEffect(() => {
		if (!activeTab || !user) return

		const fetchTabData = async () => {
			setTabLoading(true)
			setTabError(null)

			try {
				let data: (Post | User)[] = []

				switch (activeTab) {
					case 'followers':
						data = await authAPI.getFollowers(user.id)
						break
					case 'following':
						data = await authAPI.getFollowing(user.id)
						break
					case 'posts':
						// Фильтруем посты текущего пользователя
						data = posts.filter(post => post.author.id === user.id)
						break
					case 'liked':
						// Фильтруем посты, которые лайкнул пользователь
						data = posts.filter(post => post.is_liked)
						break
				}

				setTabData(data)
			} catch (err) {
				setTabError('Не удалось загрузить данные')
				console.error('Ошибка загрузки:', err)
			} finally {
				setTabLoading(false)
			}
		}

		fetchTabData()
	}, [activeTab, user, posts]) // Добавлена зависимость от posts

	useEffect(() => {
		const init = async () => {
			if (isAuthenticated) {
				await fetchProfile()
				await useBlogStore.getState().fetchPosts() // Загружаем посты
			}
		}
		init()
	}, [isAuthenticated, fetchProfile])

	const handleTabClick = (tab: typeof activeTab) => {
		setActiveTab(prev => (prev === tab ? null : tab))
	}

	const handleUnsubscribe = async (userId: number) => {
		try {
			await authAPI.unsubscribe(userId)
			if (activeTab === 'following') {
				setTabData(prev => prev.filter(user => user.id !== userId))
			}
			await fetchProfile()
		} catch (err) {
			console.error('Ошибка отписки:', err)
			setTabError('Не удалось отписаться')
		}
	}

	// Проверяем, загружается ли профиль
	if (authLoading) {
		return <div className={styles.loading}>Загрузка профиля...</div>
	}

	// Проверяем ошибки аутентификации
	if (authError) {
		return <div className={styles.error}>{authError}</div>
	}

	// Проверяем, авторизован ли пользователь
	if (!isAuthenticated) {
		return <div className={styles.error}>Пожалуйста, войдите в систему</div>
	}

	// Проверяем, загружен ли пользователь
	if (!user) {
		return <div className={styles.error}>Профиль не найден</div>
	}

	return (
		<div className={styles.profileContainer}>
			<div className={styles.profileHeader}>
				<div className={styles.avatarWrapper}>
					<img
						src={user.avatar_url}
						alt={`Аватар ${user.username}`}
						className={styles.avatar}
						// onError={(e) => {
						//   (e.target as HTMLImageElement).src = '/';
						// }}
					/>
				</div>

				<div className={styles.profileInfo}>
					<h1 className={styles.displayName}>
						{user.display_name || user.username}
					</h1>
					<p className={styles.username}>@{user.username}</p>
					<p className={styles.email}>{user.email}</p>

					<div className={styles.actions}>
						<Link to='/profile/edit' className={styles.editButton}>
							Редактировать профиль
						</Link>
						{user.is_admin && (
							<Link to='/admin' className={styles.adminButton}>
								Админ-панель
							</Link>
						)}
					</div>
				</div>
			</div>

			<div className={styles.statsContainer}>
				{[
					{
						tab: 'followers',
						label: 'Подписчики',
						count: user.subscribers_count ?? 0,
					},
					{
						tab: 'following',
						label: 'Подписки',
						count: user.subscriptions_count ?? 0,
					},
					{
						tab: 'posts',
						label: 'Посты',
						count: user.posts_count ?? 0,
					},
					{
						tab: 'liked',
						label: 'Лайки',
						count: user.liked_posts_count ?? 0,
					},
				].map(({ tab, label, count }) => (
					<div
						key={tab}
						className={`${styles.statItem} ${
							activeTab === tab ? styles.active : ''
						}`}
						onClick={() => handleTabClick(tab as typeof activeTab)}
					>
						<span className={styles.statNumber}>{count}</span>
						<span className={styles.statLabel}>{label}</span>
					</div>
				))}
			</div>

			{activeTab && (
				<div className={styles.tabContent}>
					<h2 className={styles.tabTitle}>
						{
							{
								followers: 'Подписчики',
								following: 'Подписки',
								posts: 'Мои посты',
								liked: 'Понравившиеся посты',
							}[activeTab]
						}
					</h2>

					{tabError && <div className={styles.error}>{tabError}</div>}

					{tabLoading ? (
						<div className={styles.loading}>Загрузка...</div>
					) : tabData.length === 0 ? (
						<div className={styles.emptyMessage}>
							{
								{
									followers: 'У вас пока нет подписчиков',
									following: 'Вы ни на кого не подписаны',
									posts: 'У вас пока нет постов',
									liked: 'Вы еще не лайкнули ни одного поста',
								}[activeTab]
							}
						</div>
					) : (
						<div className={styles.tabList}>
							{tabData.map(item => (
								<div key={item.id} className={styles.tabItem}>
									{activeTab === 'posts' || activeTab === 'liked' ? (
										<MiniPostCard post={item as Post} />
									) : (
										<UserCardMini
											user={item as User}
											onUnsubscribe={
												activeTab === 'following'
													? handleUnsubscribe
													: undefined
											}
										/>
									)}
								</div>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	)
}
