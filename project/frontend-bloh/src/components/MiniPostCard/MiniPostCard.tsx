import React, { useCallback, useEffect, useState } from 'react'
import { FiEye, FiHeart } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { blogAPI } from '../../api/blog'
import { Post } from '../../api/types'
import { useAuthStore } from '../../stores/authStore'
import styles from './MiniPostCard.module.css'

interface MiniPostCardProps {
	post: Post
	forceReload?: boolean
}

export const MiniPostCard: React.FC<MiniPostCardProps> = ({
	post,
	forceReload,
}) => {
	const [data, setData] = useState<Post>(post)
	const [loading, setLoading] = useState(false)
	const [likePending, setLikePending] = useState(false)
	const [anim, setAnim] = useState(false)

	const user = useAuthStore(s => s.user)
	const adjustLikedPostsCount = useAuthStore(s => s.adjustLikedPostsCount)

	const load = useCallback(async () => {
		try {
			setLoading(true)
			const fresh = await blogAPI.getPost(post.id)
			setData(fresh)
		} catch (e) {
			console.warn('MiniPostCard load error', e)
		} finally {
			setLoading(false)
		}
	}, [post.id])

	useEffect(() => {
		if (forceReload || data.views_count === undefined) {
			load()
		}
	}, [forceReload, load, data.views_count])

	const handleLike = async (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		if (likePending) return
		const prevLiked = !!data.is_liked
		try {
			setLikePending(true)
			setAnim(true)
			setTimeout(() => setAnim(false), 380)

			const { likes, is_liked } = await blogAPI.likePost(data.id)
			setData(prev => ({ ...prev, likes_count: likes, is_liked }))

			if (user && prevLiked !== is_liked) {
				adjustLikedPostsCount(is_liked ? 1 : -1)
			}
		} catch (e) {
			console.error('like error', e)
		} finally {
			setLikePending(false)
		}
	}

	const excerpt =
		data.excerpt?.trim() ||
		(data.content?.slice(0, 120) || '') +
			(data.content && data.content.length > 120 ? '…' : '')

	return (
		<Link
			to={`/posts/${data.id}`}
			className={`${styles.card} ${
				data.cover_image ? styles.hasImage : styles.noImage
			}`}
			aria-label={data.title}
		>
			{data.cover_image && (
				<img
					src={data.cover_image}
					alt={data.title}
					className={styles.image}
					loading='lazy'
				/>
			)}
			<div className={styles.body}>
				<div className={styles.mainContent}>
					<h3 className={styles.title}>{data.title}</h3>
					<p className={styles.description}>{excerpt}</p>
				</div>
				<div className={styles.metaBar}>
					<div className={styles.viewsItem}>
						<FiEye size={15} />
						<span>{data.views_count}</span>
					</div>
					<button
						className={`${styles.likeButton} ${
							data.is_liked ? styles.liked : ''
						} ${anim ? styles.pop : ''}`}
						onClick={handleLike}
						aria-pressed={!!data.is_liked}
						aria-label={data.is_liked ? 'Убрать лайк' : 'Поставить лайк'}
					>
						<span className={styles.heart}>
							<FiHeart size={16} />
						</span>
						<span>{data.likes_count}</span>
					</button>
				</div>
			</div>
		</Link>
	)
}
