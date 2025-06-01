// components/Comment/NewCommentForm.tsx
import React, { useState } from 'react'
import styles from './CommentForm.module.css'

export const NewCommentForm: React.FC<{ placeholder: string }> = ({
	placeholder,
}) => {
	const [text, setText] = useState('')

	const handleSubmit = () => {
		if (text.trim()) {
			console.log('Новый комментарий:', text)
			setText('')
		}
	}

	return (
		<div className={styles.newCommentBlock}>
			<textarea
				value={text}
				onChange={e => setText(e.target.value)}
				placeholder={placeholder}
			/>
			<button onClick={handleSubmit}>Отправить</button>
		</div>
	)
}
