import { Post } from '../../types/post.types'
import styles from './PostsFeed.module.css'
interface PostsFeedProps {
	posts: Post[]
}

export const PostsFeed: React.FC<PostsFeedProps> = ({ posts }) => {
	return (
		<div className={styles.feed}>
			{posts.map(post => (
				<div key={post.id} className={styles.card}>
					<img
						src={post.coverImage}
						alt={post.title}
						className={styles.image}
					/>
					<div className={styles.content}>
						<h3 className={styles.title}>{post.title}</h3>
						<p className={styles.excerpt}>{post.excerpt}</p>
						<div className={styles.author}>
							<img src={post.author.avatarUrl} alt={post.author.username} />
							<span>{post.author.displayName || post.author.username}</span>
							<span>{post.likesCount}</span>
						</div>
					</div>
				</div>
			))}
		</div>
	)
}
