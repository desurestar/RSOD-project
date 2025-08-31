import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FaFire } from 'react-icons/fa'
import { FiClock, FiEye, FiHeart } from 'react-icons/fi'
import { useParams } from 'react-router-dom'
import { blogAPI } from '../../api/blog'
import { Comment, Post, PostIngredient, RecipeStep } from '../../api/types'
import { CommentList } from '../../components/Comment/CommentList'
import styles from './PostPage.module.css'

export const PostPage: React.FC = () => {
	// Extract postId from URL parameters
	const { postId } = useParams<{ postId: string }>()

	// State for the post data, comments, loading status, error, and like pending
	const [post, setPost] = useState<Post | null>(null)
	const [comments, setComments] = useState<Comment[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [likePending, setLikePending] = useState(false)
	const viewSentRef = useRef(false)

	// Callback to load post and comments asynchronously
	const load = useCallback(async () => {
		if (!postId) return // Exit if no postId
		try {
			setLoading(true) // Start loading
			setError(null) // Clear previous errors
			// Fetch post and comments in parallel
			const [p, c] = await Promise.all([
				blogAPI.getPost(Number(postId)),
				blogAPI.getComments(Number(postId)),
			])
			setPost(p) // Set post state
			setComments(c) // Set comments state
		} catch (e) {
			console.error(e) // Log error
			setError('Не удалось загрузить пост') // Set error message
		} finally {
			setLoading(false) // End loading
		}
	}, [postId]) // Dependency on postId

	// Effect to load data on mount or when load changes
	useEffect(() => {
		load()
	}, [load])

	// Отправка события просмотра после успешной загрузки поста (один раз)
	useEffect(() => {
		if (post && !viewSentRef.current) {
			viewSentRef.current = true
			blogAPI
				.viewPost(post.id)
				.then(r => {
					setPost(p => (p ? { ...p, views_count: r.views } : p))
				})
				.catch(console.warn)
		}
	}, [post])

	// Handler for liking/unliking the post
	const handleLike = async () => {
		if (!post || likePending) return // Prevent if no post or pending
		try {
			setLikePending(true) // Start pending
			const { likes } = await blogAPI.likePost(post.id) // API call to like
			// Update post likes and liked status
			setPost(prev =>
				prev ? { ...prev, likes_count: likes, is_liked: !prev.is_liked } : prev
			)
		} catch (e) {
			console.error(e) // Log error
		} finally {
			setLikePending(false) // End pending
		}
	}

	// Handler for adding a new comment
	const handleAddComment = async (text: string, parent?: number) => {
		if (!post) return // Prevent if no post
		try {
			// Create comment via API
			const newComment = await blogAPI.createComment({
				post: post.id,
				content: text,
				parent_comment: parent ?? null,
			})
			// Append new comment to list
			setComments(prev => [...prev, newComment])
			// Increment comments count
			setPost(p => (p ? { ...p, comments_count: p.comments_count + 1 } : p))
		} catch (e) {
			console.error('Create comment error', e) // Log error
		}
	}

	// Render loading, error, or not found states
	if (loading) return <main className={styles.postPage}>Загрузка…</main>
	if (error) return <main className={styles.postPage}>{error}</main>
	if (!post) return <main className={styles.postPage}>Пост не найден</main>

	// Extract author details
	const author = post.author
	const authorName =
		author.display_name ||
		[author.username].filter(Boolean).join(' ') ||
		'Автор'
	const avatar = author.avatar_url || '/placeholder-avatar.png'

	// Determine if recipe stats should be shown
	const showRecipeStats =
		post.post_type === 'recipe' && (post.cooking_time || post.calories)

	// Check if it's a recipe post
	const isRecipe = post.post_type === 'recipe'

	// Extract ingredients and steps from post (with type assertions as they are optional in base Post)
	const ingredients =
		(post as Post & { ingredients?: PostIngredient[] }).ingredients || []
	const steps = (post as Post & { steps?: RecipeStep[] }).steps || []

	return (
		<main className={styles.postPage}>
			<div className={styles.card}>
				<h1 className={styles.title}>{post.title}</h1>
				<div className={styles.meta}>
					<div className={styles.authorInfo}>
						<img src={avatar} alt='avatar' className={styles.avatar} />
						<span>{authorName}</span>
					</div>
					<span className={styles.date}>
						{new Date(post.created_at).toLocaleDateString()}
					</span>
				</div>

				{post.tags && post.tags.length > 0 && (
					<div className={styles.tags}>
						{post.tags.map(tag => (
							<span
								key={tag.id}
								className={styles.tag}
								style={{
									backgroundColor: tag.color || 'var(--color-primary-light)',
								}}
							>
								{tag.name}
							</span>
						))}
					</div>
				)}

				{post.cover_image && (
					<img
						src={post.cover_image}
						alt='cover'
						className={styles.coverImage}
						loading='lazy'
					/>
				)}

				<div className={styles.stats}>
					<div className={styles.statsGroup}>
						{showRecipeStats && post.cooking_time && (
							<div>
								<FiClock /> <span>{post.cooking_time} мин</span>
							</div>
						)}
						{showRecipeStats && post.calories && (
							<div>
								<FaFire /> <span>{post.calories} ккал</span>
							</div>
						)}
					</div>
					<div className={styles.statsGroup}>
						<div>
							<FiEye /> <span>{post.views_count}</span>
						</div>
						<button
							onClick={handleLike}
							disabled={likePending}
							style={{
								background: 'none',
								border: 'none',
								cursor: 'pointer',
								display: 'flex',
								alignItems: 'center',
								gap: '.35rem',
								color: 'inherit',
								font: 'inherit',
								padding: 0,
							}}
							title={post.is_liked ? 'Убрать лайк' : 'Нравится'}
						>
							<FiHeart
								style={{
									color: post.is_liked ? 'crimson' : 'var(--color-primary)',
								}}
							/>
							<span>{post.likes_count}</span>
						</button>
					</div>
				</div>

				{post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}

				{isRecipe && ingredients.length > 0 && (
					<section className={styles.ingredientsSection}>
						<h2 className={styles.sectionTitle}>Ингредиенты</h2>
						<ul className={styles.ingredientsList}>
							{ingredients.map((item, index) => (
								<li key={index} className={styles.ingredientItem}>
									{item.ingredient.name} - {item.quantity}
								</li>
							))}
						</ul>
					</section>
				)}

				{post.content && (
					<article className={styles.content}>{post.content}</article>
				)}

				{isRecipe && steps.length > 0 && (
					<section className={styles.stepsSection}>
						<h2 className={styles.sectionTitle}>Шаги приготовления</h2>
						<ol className={styles.stepsList}>
							{steps.map(step => (
								<li key={step.id} className={styles.stepItem}>
									<div className={styles.stepDescription}>
										{step.description}
									</div>
									{step.image && (
										<img
											src={step.image}
											alt={`Шаг ${step.order}`}
											className={styles.stepImage}
											loading='lazy'
										/>
									)}
								</li>
							))}
						</ol>
					</section>
				)}
			</div>

			{/* Комментарии отдельным блоком */}
			<CommentList comments={comments} onAdd={handleAddComment} />
		</main>
	)
}
