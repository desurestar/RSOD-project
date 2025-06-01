import React from 'react'
import { FaFire } from 'react-icons/fa'
import { FiClock, FiEye, FiHeart } from 'react-icons/fi'
import { useParams } from 'react-router-dom'
import { CommentList } from '../../components/Comment/CommentList'
import { Footer } from '../../components/Footer/Footer'
import { Header } from '../../components/Heared/Header'
import { mockComments } from '../../mock/mockComment'
import { mockPosts } from '../../mock/mockData'
import styles from './PostPage.module.css'

export const PostPage: React.FC = () => {
	const { postId } = useParams<{ postId: string }>()

	const post = mockPosts.find(p => p.id === Number(postId))

	if (!post) return <p>Пост не найден</p>

	return (
		<>
			<Header />
			<main className={styles.postPage}>
				<h1 className={styles.title}>{post.title}</h1>

				<div className={styles.meta}>
					<div className={styles.authorInfo}>
						<img
							src={post.author.avatarUrl}
							alt='avatar'
							className={styles.avatar}
						/>
						<span>{post.author.displayName || post.author.username}</span>
					</div>
					<span className={styles.date}>
						{new Date(post.createdAt).toLocaleDateString()}
					</span>
				</div>

				<img src={post.coverImage} alt='cover' className={styles.coverImage} />

				<div className={styles.stats}>
					<div className={styles.statsGroup}>
						<div>
							<FiClock /> <span>{post.cookingTime} мин</span>
						</div>
						<div>
							<FaFire /> <span>{post.calories} ккал</span>
						</div>
					</div>
					<div className={styles.statsGroup}>
						<div>
							<FiEye /> <span>{post.viewsCount}</span>
						</div>
						<div>
							<FiHeart /> <span>{post.likesCount}</span>
						</div>
					</div>
				</div>

				<article className={styles.content}>{post.content}</article>
				<CommentList comments={mockComments} />
			</main>
			<Footer />
		</>
	)
}
