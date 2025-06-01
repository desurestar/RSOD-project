import React from 'react'
import { Comment } from '../../types/post.types'
import { NewCommentForm } from '../CommentForm/CommentFrom'
import styles from './Comment.module.css'
import { CommentItem } from './CommentItem'

interface CommentListProps {
	comments: Comment[]
}

export const CommentList: React.FC<CommentListProps> = ({ comments }) => {
	const topLevelComments = comments.filter(c => !c.parentCommentId)

	const handleNewCommentSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		const textarea = (e.currentTarget as HTMLFormElement).elements.namedItem(
			'comment'
		) as HTMLTextAreaElement
		console.log('Комментарий:', textarea.value)
		textarea.value = ''
	}

	return (
		<div className={styles.commentSection}>
			<h2 className={styles.sectionTitle}>Комментарии ({comments.length})</h2>

			<NewCommentForm placeholder='Ваш комментарий...' />

			{topLevelComments.map(comment => (
				<CommentItem key={comment.id} comment={comment} comments={comments} />
			))}
		</div>
	)
}
