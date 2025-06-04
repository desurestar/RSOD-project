import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthModals } from '../Modals/AuthModals/AuthModals';
import { Logo } from '../Logo/Logo';
import styles from './Header.module.css';
import { useAuthStore } from '../../stores/authStore';

export const Header: React.FC = () => {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    logout,
    fetchProfile,
  } = useAuthStore();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Загрузка профиля при монтировании
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  // Закрытие меню при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const switchAuthMode = () => {
    setAuthMode(prev => (prev === 'login' ? 'register' : 'login'));
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <Logo />
        </Link>

        <nav className={styles.nav}>
          <Link to="/">Рецепты</Link>
          <Link to="/articles">Статьи</Link>
          {isAuthenticated && <Link to="/subscriptions">Подписки</Link>}
          {user?.is_admin && <Link to="/admin">Админка</Link>}
        </nav>
    
        <div className={styles.auth}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Найти..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className={styles.searchButton}>
              <svg className={styles.searchIcon} viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
              </svg>
            </button>
          </form>

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
                aria-haspopup="true"
              >
                <img
                  src={user?.avatar_url || '/default-avatar.png'}
                  alt={user?.display_name || user?.username || 'User'}
                  className={styles.avatar}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-avatar.png';
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
                    to="/subscriptions" 
                    className={styles.dropdownItem}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Подписки
                  </Link>
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
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
  );
};