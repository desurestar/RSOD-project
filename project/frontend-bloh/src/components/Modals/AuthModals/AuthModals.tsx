import React, { useState } from 'react';
import { FaEye, FaFacebookF, FaGoogle, FaVk } from 'react-icons/fa';
import Modal from 'react-modal';
import { useAuthStore } from '../../../stores/authStore';
import { authAPI } from '../../../api/auth';
import styles from './AuthModals.module.css';

Modal.setAppElement('#root');

type AuthModalsProps = {
  isOpen: boolean;
  onRequestClose: () => void;
  mode: 'login' | 'register';
  onSwitchMode: () => void;
};

export const AuthModals: React.FC<AuthModalsProps> = ({
  isOpen,
  onRequestClose,
  mode,
  onSwitchMode,
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, register, loading, error } = useAuthStore();

  const validateForm = () => {
    if (!username || !password) {
      return 'Заполните все обязательные поля';
    }
    if (mode === 'register' && password !== confirmPassword) {
      return 'Пароли не совпадают';
    }
    if (mode === 'register' && !email) {
      return 'Email обязателен для регистрации';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      return;
    }

    if (mode === 'login') {
      await login(username, password);
    } else {
      await register(username, email, password, confirmPassword);
    }
    
    onRequestClose();
  };

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

      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          placeholder={mode === 'login' ? 'Логин' : 'Имя пользователя'}
          className={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />

        {mode === 'register' && (
          <input
            type="email"
            placeholder="Email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        )}

        <div className={styles.passwordField}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Пароль"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            type="password"
            placeholder="Подтвердите пароль"
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
        )}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
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
            <button type="button" onClick={onSwitchMode}>
              Зарегистрироваться
            </button>
          </p>
        ) : (
          <p>
            Уже есть аккаунт?{' '}
            <button type="button" onClick={onSwitchMode}>
              Войти
            </button>
          </p>
        )}
      </div>

      <div className={styles.socialAuth}>
        <p>Или войти через:</p>
        <div className={styles.icons}>
          <button
            type="button"
            className={styles.socialButton}
            onClick={() => authAPI.socialAuth('google')}
            disabled={loading}
          >
            <FaGoogle className={styles.google} />
          </button>
          <button
            type="button"
            className={styles.socialButton}
            onClick={() => authAPI.socialAuth('vk')}
            disabled={loading}
          >
            <FaVk className={styles.vk} />
          </button>
          <button
            type="button"
            className={styles.socialButton}
            onClick={() => authAPI.socialAuth('facebook')}
            disabled={loading}
          >
            <FaFacebookF className={styles.facebook} />
          </button>
        </div>
      </div>
    </Modal>
  );
};