import React, { useState } from 'react'
import { FaEye } from 'react-icons/fa'
import Modal from 'react-modal'
import { useAuthStore } from '../../../stores/authStore'
import styles from './AuthModals.module.css'

Modal.setAppElement('#root')

type AuthModalsProps = {
	isOpen: boolean
	onRequestClose: () => void
	mode: 'login' | 'register'
	onSwitchMode: () => void
}

export const AuthModals: React.FC<AuthModalsProps> = ({
	isOpen,
	onRequestClose,
	mode,
	onSwitchMode,
}) => {
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [formError, setFormError] = useState<string | null>(null) // <-- добавлено
	const { login, register, loading, error, clearError } = useAuthStore() // <-- добавлено

	const validateForm = () => {
		if (!username.trim()) return 'Введите логин'
		if (!password) return 'Введите пароль'
		if (mode === 'register') {
			if (!email.trim()) return 'Введите email'
			if (password.length < 6) return 'Пароль должен быть не менее 6 символов'
			if (password !== confirmPassword) return 'Пароли не совпадают'
		}
		return null
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setFormError(null)
		clearError()

		const validationError = validateForm()
		if (validationError) {
			setFormError(validationError)
			return
		}

		try {
			if (mode === 'login') {
				await login(username.trim(), password)
			} else {
				await register(username.trim(), email.trim(), password)
			}
			onRequestClose() // Закрываем только при успехе
		} catch {
			// Ошибка уже установлена в store (error). Модалка не закрывается.
		}
	}

	// Очистка формы и ошибок при открытии / смене режима
	React.useEffect(() => {
		if (isOpen) {
			setFormError(null)
			clearError()
		}
	}, [isOpen, mode, clearError])

	const handleSwitchMode = () => {
		setFormError(null)
		clearError()
		setPassword('')
		setConfirmPassword('')
		onSwitchMode()
	}

	return (
		<Modal
			isOpen={isOpen}
			onRequestClose={onRequestClose}
			className={styles.modal}
			overlayClassName={styles.overlay}
			shouldCloseOnOverlayClick={!loading}
		>
			<h2 className={styles.title}>
				{mode === 'login' ? 'Вход' : 'Регистрация'}
			</h2>

			{(formError || error) && (
				<div className={styles.error}>
					{formError && <div>{formError}</div>}
					{error && <div>{error}</div>}
				</div>
			)}

			<form onSubmit={handleSubmit} className={styles.form}>
				<input
					type='text'
					placeholder={mode === 'login' ? 'Логин' : 'Имя пользователя'}
					className={styles.input}
					value={username}
					onChange={e => setUsername(e.target.value)}
					disabled={loading}
				/>

				{mode === 'register' && (
					<input
						type='email'
						placeholder='Email'
						className={styles.input}
						value={email}
						onChange={e => setEmail(e.target.value)}
						disabled={loading}
					/>
				)}

				<div className={styles.passwordField}>
					<input
						type={showPassword ? 'text' : 'password'}
						placeholder='Пароль'
						className={styles.input}
						value={password}
						onChange={e => setPassword(e.target.value)}
						disabled={loading}
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
						disabled={loading}
					/>
				)}

				<button type='submit' className={styles.submitBtn} disabled={loading}>
					{loading
						? 'Загрузка...'
						: mode === 'login'
						? 'Войти'
						: 'Зарегистрироваться'}
				</button>
			</form>

			<div className={styles.switchMode}>
				{mode === 'login' ? (
					<p>
						Нет аккаунта?{' '}
						<button type='button' onClick={handleSwitchMode}>
							Зарегистрироваться
						</button>
					</p>
				) : (
					<p>
						Уже есть аккаунт?{' '}
						<button type='button' onClick={handleSwitchMode}>
							Войти
						</button>
					</p>
				)}
			</div>
		</Modal>
	)
}
