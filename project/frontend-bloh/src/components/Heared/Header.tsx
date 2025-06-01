import React, { useEffect, useRef, useState } from 'react'
import Modal from 'react-modal'
import { Link, useNavigate } from 'react-router-dom'
import { AuthModals } from '../../components/Modals/AuthModals/AuthModals'
import { useGetMeQuery } from '../../services/authApi'
import { useAuthStore } from '../../store/authStore'
import { Logo } from '../Logo/Logo'
import styles from './Header.module.css'

Modal.setAppElement('#root')

export const Header: React.FC = () => {
	const { user, setUser, logout } = useAuthStore()
	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [isLoginOpen, setIsLoginOpen] = useState(false)
	const [isRegisterOpen, setIsRegisterOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const menuRef = useRef<HTMLDivElement>(null)
	const navigate = useNavigate()

	// Запрос текущего пользователя
	const { data: currentUser, isSuccess } = useGetMeQuery(undefined, {
		skip: !!user, // чтобы не делать повторный запрос
	})

	// Если успешно получили пользователя с бэка — сохраняем в стор
	useEffect(() => {
		if (isSuccess && currentUser) {
			setUser(currentUser)
		}
	}, [isSuccess, currentUser, setUser])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => {
			document.removeEventListener('mousedown', handleClickOutside)
		}
	}, [])

	const handleLogout = () => {
		logout()
		navigate('/')
	}

	const handlerSearch = (event: React.FormEvent) => {
		event.preventDefault()
		navigate(`/search?query=${searchQuery}`)
	}

	return (
		<header className={styles.header}>
			<div className={styles.container}>
				<Link to='/' className={styles.logo}>
					<Logo />
				</Link>

				<nav className={styles.nav}>
					<Link to='/'>Рецепты</Link>
					<Link to='/article'>Статьи</Link>
					{user && <Link to='/subscriptions'>Подписки</Link>}
					{user?.role === 'admin' && <Link to='/admin'>Админка</Link>}
				</nav>

				<div className={styles.auth}>
					<form className={styles.searchFrom} onSubmit={handlerSearch}>
						<input
							type='text'
							className={styles.searchInput}
							placeholder='Найти...'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
						/>
					</form>

					{!user ? (
						<>
							<button
								className={styles.authBtn}
								onClick={() => setIsLoginOpen(true)}
							>
								Вход
							</button>
							<button
								className={styles.authBtn}
								onClick={() => setIsRegisterOpen(true)}
							>
								Регистрация
							</button>
						</>
					) : (
						<div className={styles.profileWrapper} ref={menuRef}>
							<div
								className={styles.profile}
								onClick={() => setIsMenuOpen(prev => !prev)}
							>
								<img
									src={user.avatarUrl}
									alt='avatar'
									className={styles.avatar}
								/>
								<span className={styles.username}>
									{user.displayName || user.username}
									
								</span>
							</div>
							{isMenuOpen && (
								<div className={styles.dropdown}>
									<Link to='/profile'>Профиль</Link>
									<Link to='/subscriptions'>Подписки</Link>
									<button onClick={handleLogout}>Выйти</button>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			{/* модалки авторизации */}
			<AuthModals
				isOpen={isLoginOpen}
				onRequestClose={() => setIsLoginOpen(false)}
				mode='login'
			/>
			<AuthModals
				isOpen={isRegisterOpen}
				onRequestClose={() => setIsRegisterOpen(false)}
				mode='register'
			/>
		</header>
	)
}
