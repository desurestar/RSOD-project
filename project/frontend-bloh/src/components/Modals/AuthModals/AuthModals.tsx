import React, { useState } from 'react'
import { FaEye, FaFacebookF, FaGoogle, FaVk } from 'react-icons/fa'
import Modal from 'react-modal'
import {
	useLoginMutation,
	useRegisterMutation,
} from '../../../services/authApi'
import { useAuthStore } from '../../../store/authStore'
import styles from './AuthModals.module.css'

Modal.setAppElement('#root')

type AuthModalsProps = {
	isOpen: boolean
	onRequestClose: () => void
	mode: 'login' | 'register'
}

export const AuthModals: React.FC<AuthModalsProps> = ({
	isOpen,
	onRequestClose,
	mode,
}) => {
	const [showPassword, setShowPassword] = useState(false)
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')

	const [loginUser, { isLoading: loginLoading }] = useLoginMutation()
	const [registerUser, { isLoading: registerLoading }] = useRegisterMutation()
	const setUser = useAuthStore(state => state.setUser)
	const setTokenOnLogin = useAuthStore(state => state.setTokenOnLogin)

	const validateForm = () => {
		if (!username || !password) {
			alert('Заполните все обязательные поля')
			return false
		}
		if (mode === 'register' && password !== confirmPassword) {
			alert('Пароли не совпадают')
			return false
		}
		return true
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!validateForm()) return

		try {
			if (mode === 'login') {
				const data = await loginUser({ username, password }).unwrap()
				if (data.access) setTokenOnLogin(data.access)
				if (data.user) {
					setUser({
						id: data.user.id,
						username: data.user.username,
						email: data.user.email,
						displayName: data.user.display_name,
						avatarUrl: data.user.avatar_url || '',
						role: data.user.role === 'admin' ? 'admin' : 'user',
					})
				}
			} else {
				const data = await registerUser({ username, email, password }).unwrap()
				if (data.access) setTokenOnLogin(data.access)
				if (data.user) {
					setUser({
						id: data.user.id,
						username: data.user.username,
						email: data.user.email,
						displayName: data.user.display_name,
						avatarUrl: data.user.avatar_url || '',
						role: data.user.role === 'admin' ? 'admin' : 'user',
					})
				}
			}
			onRequestClose()
		} catch (error) {
			if (typeof error === 'object' && error !== null && 'data' in error) {
				const apiError = error as { data?: { message?: string } }
				alert(apiError.data?.message || 'Произошла ошибка')
			} else {
				alert(
					mode === 'login'
						? 'Неверный логин или пароль'
						: 'Ошибка при регистрации'
				)
			}
		}
	}

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onRequestClose}
			className={styles.modal}
			overlayClassName={styles.overlay}
		>
			<h2 className={styles.title}>
				{mode === 'login' ? 'Вход' : 'Регистрация'}
			</h2>

			<form onSubmit={handleSubmit} className={styles.form}>
				<input
					type='text'
					placeholder={mode === 'login' ? 'Логин' : 'Имя пользователя'}
					className={styles.input}
					value={username}
					onChange={e => setUsername(e.target.value)}
				/>

				{mode === 'register' && (
					<input
						type='email'
						placeholder='Email'
						className={styles.input}
						value={email}
						onChange={e => setEmail(e.target.value)}
					/>
				)}

				<div className={styles.passwordField}>
					<input
						type={showPassword ? 'text' : 'password'}
						placeholder='Пароль'
						className={styles.input}
						value={password}
						onChange={e => setPassword(e.target.value)}
					/>
					<FaEye
						onMouseDown={() => setShowPassword(true)}
						onMouseUp={() => setShowPassword(false)}
						onMouseLeave={() => setShowPassword(false)}
						className={styles.eyeIcon}
					/>
				</div>

				{mode === 'register' && (
					<input
						type='password'
						placeholder='Подтвердите пароль'
						className={styles.input}
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
					/>
				)}

				<button
					type='submit'
					className={styles.submitBtn}
					disabled={loginLoading || registerLoading}
				>
					{mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
				</button>
			</form>

			<div className={styles.socialAuth}>
				<p>
					{mode === 'login'
						? 'Войти с помощью:'
						: 'Зарегистрироваться с помощью:'}
				</p>
				<div className={styles.icons}>
					<FaGoogle className={styles.google} />
					<FaVk className={styles.vk} />
					<FaFacebookF className={styles.facebook} />
				</div>
			</div>
		</Modal>
	)
}
