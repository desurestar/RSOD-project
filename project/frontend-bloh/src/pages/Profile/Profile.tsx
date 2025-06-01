import React, { useState } from 'react'
import { Footer } from '../../components/Footer/Footer'
import { Header } from '../../components/Heared/Header'
import { MiniPostCard } from '../../components/MiniPostCard/MiniPostCard'
import { mockPosts } from '../../mock/mockData'
import { useAuthStore } from '../../store/authStore'
import styles from './Profile.module.css'

export const Profile: React.FC = () => {
	const { user } = useAuthStore()
	const [activeTab, setActiveTab] = useState<
		'followers' | 'following' | 'posts' | 'liked' | null
	>(null)

	if (!user) return <p>Загрузка профиля...</p>

	const handleTabClick = (tab: typeof activeTab) => {
		setActiveTab(prev => (prev === tab ? null : tab))
	}

	return (
		<>
			<Header />
			<div className={styles.profilePage}>
				<div className={styles.card}>
					<img className={styles.avatar} src={user.avatarUrl} alt='avatar' />
					<h2 className={styles.name}>{user.displayName || user.username}</h2>
					<div className={styles.email}>{user.email}</div>
					<button className={styles.editBtn}>Редактировать профиль</button>
				</div>

				<div className={styles.stats}>
					<div onClick={() => handleTabClick('followers')}>
						<span>Подписчики</span>
						<strong>{user.subscribersCount || 0}</strong>
					</div>
					<div onClick={() => handleTabClick('following')}>
						<span>Подписки</span>
						<strong>{user.subscriptionsCount || 0}</strong>
					</div>
					<div onClick={() => handleTabClick('posts')}>
						<span>Посты</span>
						<strong>{user.postsCount || 0}</strong>
					</div>
					<div onClick={() => handleTabClick('liked')}>
						<span>Понравилось</span>
						<strong>{user.likedPostsCount || 0}</strong>
					</div>
				</div>

				{activeTab && (
					<div className={styles.tabContent}>
						<h3 className={styles.tabTitle}>
							{activeTab === 'followers' && 'Список подписчиков'}
							{activeTab === 'following' && 'Список подписок'}
							{activeTab === 'posts' && 'Список постов'}
							{activeTab === 'liked' && 'Понравившиеся посты'}
						</h3>
						<ul className={styles.tabList}>
							{activeTab === 'liked' ? (
								user.likedPosts?.length ? (
									mockPosts
										.filter(post => user.likedPosts?.includes(post.id))
										.map(post => <MiniPostCard key={post.id} post={post} />)
								) : (
									<li>Пока ничего не понравилось.</li>
								)
							) : (
								<li>Заглушка для раздела "{activeTab}"</li>
							)}
						</ul>
					</div>
				)}
			</div>
			<Footer />
		</>
	)
}
