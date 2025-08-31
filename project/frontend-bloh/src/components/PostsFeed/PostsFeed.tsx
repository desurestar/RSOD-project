import { Link } from 'react-router-dom'
import { Post } from '../../api/types'
import styles from './PostsFeed.module.css'

interface PostsFeedProps {
	posts: Post[]
	emptyText?: string
}

export const PostsFeed: React.FC<PostsFeedProps> = ({
	posts,
	emptyText = 'Нет опубликованных записей',
}) => {
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

	if (!posts.length) {
		return <div style={{ padding: '1rem', opacity: 0.7 }}>{emptyText}</div>
	}

	return (
		<div className={styles.feed}>
			{posts.map(post => {
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

						{post.cover_image && (
							<img
								src={post.cover_image}
								alt={post.title}
								className={styles.image}
								loading='lazy'
							/>
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
									{post.cooking_time && <span>⏱ {post.cooking_time} мин</span>}
									{post.calories && <span>🔥 {post.calories} ккал</span>}
								</div>
							) : (
								<span style={{ fontSize: '.65rem', color: '#777' }}>
									{post.post_type === 'article' ? 'Статья' : ''}
								</span>
							)}
							<div className={styles.statsGroup}>
								<span>👁 {post.views_count}</span>
								<span>❤️ {post.likes_count}</span>
							</div>
						</div>
					</Link>
				)
			})}
		</div>
	)
}
