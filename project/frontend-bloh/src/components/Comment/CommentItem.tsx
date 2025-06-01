import React, { useState } from 'react'
import { Comment } from '../../types/post.types'
import { NewCommentForm } from '../CommentForm/CommentFrom'
import styles from './Comment.module.css'

interface CommentItemProps {
	comment: Comment
	comments: Comment[]
}

export const CommentItem: React.FC<CommentItemProps> = ({
	comment,
	comments,
}) => {
	const [isReplying, setIsReplying] = useState(false)
	const [showAllReplies, setShowAllReplies] = useState(false)

	const childComments = comments.filter(c => c.parentCommentId === comment.id)
	const visibleReplies = showAllReplies
		? childComments
		: childComments.slice(0, 3)

	const handleReplySubmit = () => {
		console.log('Ответ отправлен')
		setIsReplying(false)
	}

	return (
		<div className={styles.commentItem}>
			<div className={styles.header}>
				<img
					src={comment.author.avatarUrl}
					alt='avatar'
					className={styles.avatar}
				/>
				<strong className={styles.username}>
					{comment.author.displayName || comment.author.username}
				</strong>
			</div>
			<p className={styles.content}>{comment.content}</p>

			<div className={styles.footer}>
				<button
					onClick={() => setIsReplying(!isReplying)}
					className={styles.replyBtn}
				>
					{isReplying ? 'Отмена' : 'Ответить'}
				</button>
				<span className={styles.date}>
					{new Date(comment.createdAt).toLocaleDateString()}
				</span>
			</div>

			{isReplying && <NewCommentForm placeholder='Ваш ответ...' />}

			{visibleReplies.length > 0 && (
				<div className={styles.replies}>
					{visibleReplies.map(reply => (
						<CommentItem key={reply.id} comment={reply} comments={comments} />
					))}
					{childComments.length > 3 && (
						<button
							className={styles.showAllBtn}
							onClick={() => setShowAllReplies(prev => !prev)}
						>
							{showAllReplies
								? 'Скрыть ответы'
								: `Показать все ответы (${childComments.length})`}
						</button>
					)}
				</div>
			)}
		</div>
	)
}
