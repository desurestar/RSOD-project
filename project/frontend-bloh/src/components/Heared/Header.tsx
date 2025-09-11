import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { Logo } from '../Logo/Logo'
import { AuthModals } from '../Modals/AuthModals/AuthModals'
import styles from './Header.module.css'

export const Header: React.FC = () => {
	const {
		user,
		isAuthenticated,
		loading: authLoading,
		logout,
		fetchProfile,
	} = useAuthStore()

	const [isMenuOpen, setIsMenuOpen] = useState(false)
	const [authModalOpen, setAuthModalOpen] = useState(false)
	const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
	// ...removed search state...
	const menuRef = useRef<HTMLDivElement>(null)
	const navigate = useNavigate()

	useEffect(() => {
		if (isAuthenticated) {
			fetchProfile()
		}
	}, [isAuthenticated, fetchProfile])

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setIsMenuOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	const handleLogout = async () => {
		await logout()
		navigate('/')
		setIsMenuOpen(false)
	}

	// ...removed handleSearch...

	const openAuthModal = (mode: 'login' | 'register') => {
		setAuthMode(mode)
		setAuthModalOpen(true)
	}

	const closeAuthModal = () => {
		setAuthModalOpen(false)
	}

	const switchAuthMode = () => {
		setAuthMode(prev => (prev === 'login' ? 'register' : 'login'))
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
					{isAuthenticated && <Link to='/subscriptions'>Подписки</Link>}
					{user?.is_admin && <Link to='/admin'>Админка</Link>}
				</nav>

				<div className={styles.auth}>
					{/* ...removed search form... */}
					{!isAuthenticated ? (
						<div className={styles.authButtons}>
							<button
								className={`${styles.authBtn} ${styles.loginBtn}`}
								onClick={() => openAuthModal('login')}
								disabled={authLoading}
							>
								Вход
							</button>
							<button
								className={`${styles.authBtn} ${styles.registerBtn}`}
								onClick={() => openAuthModal('register')}
								disabled={authLoading}
							>
								Регистрация
							</button>
						</div>
					) : (
						<div className={styles.profileWrapper} ref={menuRef}>
							<div
								className={styles.profile}
								onClick={() => setIsMenuOpen(prev => !prev)}
								aria-expanded={isMenuOpen}
								aria-haspopup='true'
							>
								<img
									src={user?.avatar_url || '/default-avatar.png'}
									alt={user?.display_name || user?.username || 'User'}
									className={styles.avatar}
									onError={e => {
										const target = e.target as HTMLImageElement
										target.src = '/default-avatar.png'
									}}
								/>
								<span className={styles.username}>
									{user?.display_name || user?.username}
								</span>
							</div>

							{isMenuOpen && (
								<div className={styles.dropdown}>
									<Link
										to={`/profile/`}
										className={styles.dropdownItem}
										onClick={() => setIsMenuOpen(false)}
									>
										Профиль
									</Link>
									<Link
										to='/subscriptions'
										className={styles.dropdownItem}
										onClick={() => setIsMenuOpen(false)}
									>
										Подписки
									</Link>
									{user?.role === 'admin' && (
										<Link
											to='/admin'
											className={styles.dropdownItem}
											onClick={() => setIsMenuOpen(false)}
										>
											Админ панель
										</Link>
									)}
									<button
										className={styles.dropdownItem}
										onClick={handleLogout}
										disabled={authLoading}
									>
										Выйти
									</button>
								</div>
							)}
						</div>
					)}
				</div>
			</div>

			<AuthModals
				isOpen={authModalOpen}
				onRequestClose={closeAuthModal}
				mode={authMode}
				onSwitchMode={switchAuthMode}
			/>
		</header>
	)
}
