import React, { useState } from 'react'
import { Comment } from '../../api/types'
import { NewCommentForm } from '../CommentForm/CommentFrom'
import styles from './Comment.module.css'

interface CommentItemProps {
	comment: Comment
	all: Comment[]
	onReply: (parentId: number, text: string) => Promise<void>
	level?: number
}

export const CommentItem: React.FC<CommentItemProps> = ({
	comment,
	all,
	onReply,
	level = 0,
}) => {
	const [isReplying, setIsReplying] = useState(false)
	const [showAllReplies, setShowAllReplies] = useState(false)

	const replies = all
		.filter(c => c.parent_comment === comment.id)
		.sort(
			(a, b) =>
				new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
		)

	const visibleReplies = showAllReplies ? replies : replies.slice(0, 3)

	const author = comment.author
	const avatar = author.avatar_url || '/placeholder-avatar.png'
	const authorName = author.display_name || author.username || 'Автор'

	return (
		<div className={styles.commentItem} style={{ marginLeft: level ? 16 : 0 }}>
			<div className={styles.header}>
				<img src={avatar} alt='avatar' className={styles.avatar} />
				<strong className={styles.username}>{authorName}</strong>
			</div>
			<p className={styles.content}>{comment.content}</p>

			<div className={styles.footer}>
				<button
					onClick={() => setIsReplying(p => !p)}
					className={styles.replyBtn}
				>
					{isReplying ? 'Отмена' : 'Ответить'}
				</button>
				<span className={styles.date}>
					{new Date(comment.created_at).toLocaleDateString()}
				</span>
			</div>

			{isReplying && (
				<NewCommentForm
					placeholder='Ваш ответ...'
					onSubmit={async text => {
						await onReply(comment.id, text)
						setIsReplying(false)
					}}
					autoFocus
				/>
			)}

			{visibleReplies.length > 0 && (
				<div className={styles.replies}>
					{visibleReplies.map(r => (
						<CommentItem
							key={r.id}
							comment={r}
							all={all}
							onReply={onReply}
							level={level + 1}
						/>
					))}
					{replies.length > 3 && (
						<button
							className={styles.showAllBtn}
							onClick={() => setShowAllReplies(s => !s)}
						>
							{showAllReplies
								? 'Скрыть ответы'
								: `Показать все ответы (${replies.length})`}
						</button>
					)}
				</div>
			)}
		</div>
	)
}
