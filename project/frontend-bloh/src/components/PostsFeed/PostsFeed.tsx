import { useCallback, useEffect, useState } from 'react'
import { FaFire } from 'react-icons/fa'
import { FiClock, FiEye, FiHeart } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { blogAPI } from '../../api/blog'
import { Post } from '../../api/types'
import styles from './PostsFeed.module.css'

interface PostsFeedProps {
	posts: Post[]
	emptyText?: string
	onLikeChange?: (post: Post) => void
}

export const PostsFeed: React.FC<PostsFeedProps> = ({
	posts,
	emptyText = 'Нет опубликованных записей',
	onLikeChange,
}) => {
	const [items, setItems] = useState(posts)
	const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())

	useEffect(() => {
		setItems(posts)
	}, [posts])

	const getTextColor = (bgColor: string): string => {
		if (!bgColor || !/^#?[0-9a-fA-F]{6}$/.test(bgColor)) return '#285845'
		const hex = bgColor.replace('#', '')
		const r = parseInt(hex.substring(0, 2), 16)
		const g = parseInt(hex.substring(2, 4), 16)
		const b = parseInt(hex.substring(4, 6), 16)
		const brightness = (r * 299 + g * 587 + b * 114) / 1000
		return brightness > 150 ? '#285845' : '#fff'
	}

	const getAuthorName = (post: Post) => {
		const a: any = post.author
		return (
			a?.display_name ||
			[a?.first_name, a?.last_name].filter(Boolean).join(' ') ||
			a?.username ||
			'Автор'
		)
	}

	const getAuthorAvatar = (post: Post) => {
		const a: any = post.author
		return a?.avatar || a?.avatar_url || '/placeholder-avatar.png'
	}

	const handleLike = useCallback(
		async (e: React.MouseEvent, id: number) => {
			e.preventDefault()
			e.stopPropagation()
			if (pendingIds.has(id)) return
			setPendingIds(s => new Set(s).add(id))

			// Оптимистичное обновление
			let rollback: { likes_count: number; is_liked: boolean } | null = null
			setItems(list =>
				list.map(p => {
					if (p.id !== id) return p
					rollback = { likes_count: p.likes_count, is_liked: !!p.is_liked }
					const optimisticLiked = !p.is_liked
					return {
						...p,
						is_liked: optimisticLiked,
						likes_count: p.likes_count + (optimisticLiked ? 1 : -1),
					}
				})
			)

			try {
				const { likes, is_liked } = await blogAPI.likePost(id)
				setItems(list =>
					list.map(p =>
						p.id === id ? { ...p, likes_count: likes, is_liked } : p
					)
				)
				const changed = items.find(p => p.id === id)
				if (changed && onLikeChange) {
					onLikeChange({ ...changed, likes_count: likes, is_liked })
				}
			} catch (err) {
				console.warn('Like error', err)
				// Откат
				if (rollback) {
					setItems(list =>
						list.map(p =>
							p.id === id
								? {
										...p,
										likes_count: rollback!.likes_count,
										is_liked: rollback!.is_liked,
								  }
								: p
						)
					)
				}
			} finally {
				setPendingIds(s => {
					const ns = new Set(s)
					ns.delete(id)
					return ns
				})
			}
		},
		[pendingIds, items, onLikeChange]
	)

	if (!items.length) {
		return <div style={{ padding: '1rem', opacity: 0.7 }}>{emptyText}</div>
	}

	return (
		<div className={styles.feed}>
			{items.map(post => {
				const hasRecipeStats = !!(post.cooking_time || post.calories)
				return (
					<Link to={`/posts/${post.id}`} key={post.id} className={styles.card}>
						<div className={styles.header}>
							<div className={styles.authorInfo}>
								<img
									src={getAuthorAvatar(post)}
									alt={getAuthorName(post)}
									className={styles.avatar}
									loading='lazy'
								/>
								<span>{getAuthorName(post)}</span>
							</div>
							<span className={styles.date}>
								{new Date(post.created_at).toLocaleDateString()}
							</span>
						</div>

						{post.cover_image ? (
							<img
								src={post.cover_image}
								alt={post.title}
								className={styles.image}
								loading='lazy'
							/>
						) : (
							<div className={styles.imagePlaceholder}>
								<span>
									{post.post_type === 'article' ? 'Статья' : 'Рецепт'}
								</span>
							</div>
						)}

						<div className={styles.content}>
							<h3 className={styles.title}>{post.title}</h3>
							<p className={styles.excerpt}>{post.excerpt}</p>
							{!!post.tags?.length && (
								<div className={styles.tags}>
									{post.tags.map(tag => {
										const bgColor = tag.color || '#e8f3ed'
										return (
											<span
												key={tag.id}
												className={styles.tag}
												style={{
													backgroundColor: bgColor,
													color: getTextColor(bgColor),
												}}
											>
												#{tag.name}
											</span>
										)
									})}
								</div>
							)}
						</div>

						<div className={styles.footer}>
							{hasRecipeStats ? (
								<div className={styles.statsGroup}>
									{post.cooking_time && (
										<span
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: 4,
											}}
										>
											<FiClock /> {post.cooking_time} мин
										</span>
									)}
									{post.calories && (
										<span
											style={{
												display: 'flex',
												alignItems: 'center',
												gap: 4,
											}}
										>
											<FaFire /> {post.calories} ккал
										</span>
									)}
								</div>
							) : (
								<span style={{ fontSize: '.65rem', color: '#777' }}>
									{post.post_type === 'article' ? 'Статья' : ''}
								</span>
							)}
							<div className={styles.statsGroup} style={{ gap: '0.75rem' }}>
								<span
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: 4,
									}}
								>
									<FiEye /> {post.views_count}
								</span>
								<button
									onClick={e => handleLike(e, post.id)}
									aria-pressed={!!post.is_liked}
									disabled={pendingIds.has(post.id)}
									title={post.is_liked ? 'Убрать лайк' : 'Поставить лайк'}
									aria-label={post.is_liked ? 'Убрать лайк' : 'Поставить лайк'}
									className={`${styles.likeButton} ${
										post.is_liked ? styles.likeActive : ''
									}`}
								>
									<FiHeart />
									<span>{post.likes_count}</span>
								</button>
							</div>
						</div>
					</Link>
				)
			})}
		</div>
	)
}
