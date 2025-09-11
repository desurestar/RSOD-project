import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../../api/auth'
import { blogAPI } from '../../api/blog'
import { Post, User } from '../../api/types'
import { MiniPostCard } from '../../components/MiniPostCard/MiniPostCard'
import { PostEditModal } from '../../components/Modals/PostEditModal/PostEditModal'
import { UserCardMini } from '../../components/UserCardMini/UserCardMini'
import { useAuthStore } from '../../stores/authStore'
import styles from './Profile.module.css'

export const Profile: React.FC = () => {
	const {
		user,
		isAuthenticated,
		fetchProfile,
		loading: authLoading,
		error: authError,
	} = useAuthStore()

	const [activeTab, setActiveTab] = useState<
		'followers' | 'following' | 'posts' | 'liked' | null
	>(null)
	const [tabData, setTabData] = useState<(Post | User)[]>([])
	const [tabLoading, setTabLoading] = useState(false)
	const [tabError, setTabError] = useState<string | null>(null)
	const [editingPost, setEditingPost] = useState<Post | null>(null)
	const tabCache = useRef<Record<string, (Post | User)[]>>({})
	const [postsSubTab, setPostsSubTab] = useState<'published' | 'drafts'>(
		'published'
	)

	useEffect(() => {
		if (isAuthenticated) {
			fetchProfile()
		}
	}, [isAuthenticated, fetchProfile])

	const loadTab = async (tab: typeof activeTab) => {
		if (!user || !tab) return
		if (tabCache.current[tab]) {
			setTabData(tabCache.current[tab])
			return
		}
		setTabLoading(true)
		setTabError(null)
		try {
			let data: (Post | User)[] = []
			switch (tab) {
				case 'followers':
					data = await authAPI.getFollowers(user.id)
					break
				case 'following':
					data = await authAPI.getFollowing(user.id)
					break
				case 'posts':
					data = await blogAPI.getUserPosts(user.id)
					break
				case 'liked':
					data = await blogAPI.getUserLikedPosts(user.id)
					break
			}
			tabCache.current[tab] = data
			setTabData(data)
		} catch (e) {
			setTabError('Не удалось загрузить данные')
			console.error(e)
		} finally {
			setTabLoading(false)
		}
	}

	useEffect(() => {
		if (activeTab) {
			loadTab(activeTab)
		}
	}, [activeTab, user])

	const handleTabClick = (tab: typeof activeTab) => {
		setActiveTab(prev => (prev === tab ? null : tab))
	}

	const handleUnsubscribe = async (userId: number) => {
		try {
			await authAPI.unsubscribe(userId)
			// Инвалидируем кэш вкладок following / followers и профиль
			delete tabCache.current.following
			delete tabCache.current.followers
			if (activeTab === 'following') {
				setTabData(prev => prev.filter(u => u.id !== userId))
			}
			await fetchProfile()
		} catch (err) {
			console.error('Ошибка отписки:', err)
			setTabError('Не удалось отписаться')
		}
	}

	const handleDraftClick = (p: Post) => {
		setEditingPost(p)
	}

	const handlePostSaved = (updated: Post) => {
		// обновляем кэш вкладки "posts"
		tabCache.current.posts = (tabCache.current.posts || []).map(item =>
			(item as Post).id === updated.id ? updated : item
		)
		if (activeTab === 'posts') {
			setTabData(prev =>
				prev.map(item => ((item as Post).id === updated.id ? updated : item))
			)
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
						src={user.avatar_url || '/default-avatar.png'}
						alt={`Аватар ${user.username}`}
						className={styles.avatar}
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
					) : activeTab === 'posts' ? (
						<div>
							<div className={styles.postsSubTabs}>
								<button
									type='button'
									className={`${styles.postsSubTabButton} ${
										postsSubTab === 'published' ? styles.active : ''
									}`}
									onClick={() => setPostsSubTab('published')}
								>
									Опубликованные
								</button>
								<button
									type='button'
									className={`${styles.postsSubTabButton} ${
										postsSubTab === 'drafts' ? styles.active : ''
									}`}
									onClick={() => setPostsSubTab('drafts')}
								>
									Черновики
								</button>
							</div>
							{(() => {
								const posts = tabData as Post[]
								const published = posts.filter(p => p.status === 'published')
								const drafts = posts.filter(p => p.status === 'draft')
								const list = postsSubTab === 'published' ? published : drafts

								if (list.length === 0) {
									return (
										<div className={styles.emptyMessage}>
											{postsSubTab === 'published'
												? 'Нет опубликованных постов'
												: 'Нет черновиков'}
										</div>
									)
								}

								return (
									<div className={styles.tabList}>
										{list.map(p =>
											postsSubTab === 'published' ? (
												<div key={p.id} className={styles.tabItem}>
													<MiniPostCard post={p} />
												</div>
											) : (
												<div
													key={p.id}
													className={`${styles.tabItem} ${styles.draftItem}`}
													onClick={() => handleDraftClick(p)}
													title='Редактировать черновик'
												>
													<div className={styles.draftTitle}>
														{p.title || '(Без названия)'}
													</div>
													<div className={styles.draftMeta}>
														<span>Черновик</span>
														<span>
															{new Date(p.updated_at).toLocaleDateString()}
														</span>
													</div>
												</div>
											)
										)}
									</div>
								)
							})()}
						</div>
					) : (
						<div className={styles.tabList}>
							{tabData.map(item => (
								<div key={item.id} className={styles.tabItem}>
									{activeTab === 'liked' ? (
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
			{editingPost && (
				<PostEditModal
					post={editingPost}
					onClose={() => setEditingPost(null)}
					onSave={handlePostSaved}
				/>
			)}
		</div>
	)
}
