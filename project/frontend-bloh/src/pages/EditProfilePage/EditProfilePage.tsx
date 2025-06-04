import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { authAPI } from '../../api/auth';
import styles from './EditProfilePage.module.css';

export const EditProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        email: user.email,
      });
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Сначала обновляем основные данные профиля
      const updatedUser = await authAPI.updateProfile(formData);
      updateUser(updatedUser);

      // 2. Если есть новый аватар - обновляем его отдельным запросом
      if (avatarFile) {
        setAvatarLoading(true);
        const userWithNewAvatar = await authAPI.updateAvatar(avatarFile);
        updateUser(userWithNewAvatar);
      }

      // Можно добавить уведомление об успешном сохранении
    } catch (err) {
      setError('Не удалось обновить профиль. Пожалуйста, попробуйте снова.');
      console.error('Profile update error:', err);
    } finally {
      setIsLoading(false);
      setAvatarLoading(false);
    }
  };

  if (!user) {
    return <div className={styles.loading}>Загрузка данных пользователя...</div>;
  }

  const isLoadingState = isLoading || avatarLoading;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Редактирование профиля</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.avatarUpload}>
          <label className={styles.avatarLabel}>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className={styles.avatarInput}
              disabled={isLoadingState}
            />
            <div className={styles.avatarWrapper}>
              <img 
                src={avatarPreview || '../../../public/default-avatar.png'} 
                alt="Аватар" 
                className={styles.avatar}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '../../../public/default-avatar.png';
                }}
              />
              <div className={styles.avatarOverlay}>
                {avatarLoading ? (
                  <span className={styles.spinner}></span>
                ) : (
                  <span className={styles.avatarEditText}>Изменить</span>
                )}
              </div>
            </div>
          </label>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Имя для отображения</label>
          <input
            type="text"
            name="display_name"
            value={formData.display_name}
            onChange={handleChange}
            placeholder="Введите ваше имя"
            className={styles.input}
            disabled={isLoadingState}
          />
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Введите ваш email"
            className={styles.input}
            disabled={isLoadingState}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttons}>
          <button 
            type="submit" 
            className={`${styles.button} ${styles.primary}`}
            disabled={isLoadingState}
          >
            {isLoadingState ? (
              <span className={styles.spinner}></span>
            ) : (
              'Сохранить изменения'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};