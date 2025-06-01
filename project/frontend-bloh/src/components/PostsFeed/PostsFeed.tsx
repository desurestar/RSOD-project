import { Link } from 'react-router-dom'
import { recipeTags } from '../../mock/mockTags'
import { Post } from '../../types/post.types'
import styles from './PostsFeed.module.css'

interface PostsFeedProps {
	posts: Post[]
}

export const PostsFeed: React.FC<PostsFeedProps> = ({ posts }) => {
	const getTextColor = (bgColor: string): string => {
		const hex = bgColor.replace('#', '')
		const r = parseInt(hex.substring(0, 2), 16)
		const g = parseInt(hex.substring(2, 4), 16)
		const b = parseInt(hex.substring(4, 6), 16)

		const brightness = (r * 299 + g * 587 + b * 114) / 1000
		return brightness > 150 ? '#333' : '#fff'
	}

	return (
		<div className={styles.feed}>
			{posts.map(post => (
				<Link to={`/posts/${post.id}`} key={post.id} className={styles.card}>
					<div className={styles.header}>
						<div className={styles.authorInfo}>
							<img
								src={post.author.avatarUrl}
								alt={post.author.username}
								className={styles.avatar}
							/>
							<span>{post.author.displayName || post.author.username}</span>
						</div>
						<span className={styles.date}>
							{new Date(post.createdAt).toLocaleDateString()}
						</span>
					</div>
					<img
						src={post.coverImage}
						alt={post.title}
						className={styles.image}
					/>
					<div className={styles.content}>
						<h3 className={styles.title}>{post.title}</h3>
						<p className={styles.excerpt}>{post.excerpt}</p>
						<div className={styles.tags}>
							{post.tags.map(tag => {
								const tagData = recipeTags.find(t => t.id === tag.id)
								const bgColor = tagData?.color || '#e0f2e9'
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
					</div>
					<div className={styles.footer}>
						<div className={styles.statsGroup}>
							{post.cookingTime && (
								<div>
									<span>⏱ {post.cookingTime} мин</span>
								</div>
							)}
							{post.calories && (
								<div>
									<span>🔥 {post.calories} ккал</span>
								</div>
							)}
						</div>
						<div className={styles.statsGroup}>
							<div>
								<span>👁 {post.viewsCount}</span>
							</div>
							<div>
								<span>❤️ {post.likesCount}</span>
							</div>
						</div>
					</div>
				</Link>
			))}
		</div>
	)
}
