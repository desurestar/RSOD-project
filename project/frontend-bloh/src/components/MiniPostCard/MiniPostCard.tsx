import React from 'react'
import { Link } from 'react-router-dom'
import { Post } from '../../types/post.types'
import styles from './MiniPostCard.module.css'

interface MiniPostCardProps {
	post: Post
}

export const MiniPostCard: React.FC<MiniPostCardProps> = ({ post }) => {
	return (
		<Link to={`/posts/${post.id}`} className={styles.card}>
			<img src={post.coverImage} alt={post.title} className={styles.image} />
			<div className={styles.content}>
				<h3 className={styles.title}>{post.title}</h3>
				<p className={styles.description}>{post.excerpt}</p>
			</div>
		</Link>
	)
}
