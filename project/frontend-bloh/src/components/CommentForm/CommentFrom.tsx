// components/Comment/NewCommentForm.tsx
import React, { useState } from 'react'
import styles from './CommentForm.module.css'

interface NewCommentFormProps {
	placeholder: string
	onSubmit: (text: string) => Promise<void> | void
	disabled?: boolean
	autoFocus?: boolean
}

export const NewCommentForm: React.FC<NewCommentFormProps> = ({
	placeholder,
	onSubmit,
	disabled,
	autoFocus,
}) => {
	const [text, setText] = useState('')
	const [pending, setPending] = useState(false)

	const handleSend = async () => {
		if (!text.trim() || pending || disabled) return
		try {
			setPending(true)
			await onSubmit(text.trim())
			setText('')
		} finally {
			setPending(false)
		}
	}

	return (
		<div className={styles.newCommentBlock}>
			<textarea
				value={text}
				onChange={e => setText(e.target.value)}
				placeholder={placeholder}
				disabled={disabled || pending}
				rows={3}
				autoFocus={autoFocus}
			/>
			<div className={styles.actions}>
				<button
					onClick={handleSend}
					disabled={!text.trim() || pending || disabled}
				>
					{pending ? '...' : 'Отправить'}
				</button>
			</div>
		</div>
	)
}
