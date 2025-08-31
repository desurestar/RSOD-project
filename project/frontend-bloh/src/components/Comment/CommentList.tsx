import React from 'react'
import { Comment } from '../../api/types'
import { NewCommentForm } from '../CommentForm/CommentFrom'
import styles from './Comment.module.css'
import { CommentItem } from './CommentItem'

interface CommentListProps {
	comments: Comment[]
	onAdd: (text: string, parentId?: number) => Promise<void>
}

export const CommentList: React.FC<CommentListProps> = ({
	comments,
	onAdd,
}) => {
	const topLevel = comments
		.filter(c => !c.parent_comment)
		.sort(
			(a, b) =>
				new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
		)

	return (
		<div className={styles.commentSection}>
			<h2 className={styles.sectionTitle}>Комментарии ({comments.length})</h2>

			<NewCommentForm
				placeholder='Ваш комментарий...'
				onSubmit={text => onAdd(text)}
			/>

			{topLevel.map(c => (
				<CommentItem
					key={c.id}
					comment={c}
					all={comments}
					onReply={(parentId, text) => onAdd(text, parentId)}
				/>
			))}
			{!comments.length && (
				<div style={{ opacity: 0.6, padding: '0.5rem 0' }}>
					Нет комментариев
				</div>
			)}
		</div>
	)
}
