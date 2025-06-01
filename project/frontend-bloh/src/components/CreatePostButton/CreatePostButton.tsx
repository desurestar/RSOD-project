import React from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './CreatePostButton.module.css'

export const CreatePostButton: React.FC = () => {
	const navigate = useNavigate()
	return (
		<button
			className={styles.createPostBtn}
			onClick={() => navigate('/create-post')}
		>
			<span className={styles.icon}>
				<svg width='20' height='20' viewBox='0 0 20 20' fill='none'>
					<circle cx='10' cy='10' r='10' fill='#fff' />
					<path
						d='M10 5V15'
						stroke='#2B7FFF'
						strokeWidth='2'
						strokeLinecap='round'
					/>
					<path
						d='M5 10H15'
						stroke='#2B7FFF'
						strokeWidth='2'
						strokeLinecap='round'
					/>
				</svg>
			</span>
			Написать
		</button>
	)
}
