import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { authAPI } from '../../api/auth';
import styles from './EditProfilePage.module.css';

export const EditProfilePage = () => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    display_name: '',
    email: '',
    avatar: null as File | null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Заполняем форму данными пользователя при загрузке
  useEffect(() => {
    if (user) {
      setFormData({
        display_name: user.display_name || '',
        email: user.email,
        avatar: null
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
      setFormData(prev => ({ ...prev, avatar: file }));
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
      const formDataToSend = new FormData();
      formDataToSend.append('display_name', formData.display_name);
      formDataToSend.append('email', formData.email);
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }

      const updatedUser = await authAPI.updateProfile(formDataToSend);
      updateUser(updatedUser);
      // Можно добавить уведомление об успешном сохранении
    } catch (err) {
      setError('Не удалось обновить профиль. Пожалуйста, попробуйте снова.');
      console.error('Profile update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <div className={styles.loading}>Загрузка данных пользователя...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Редактирование профиля</h1>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Компонент загрузки аватара */}
        <div className={styles.avatarUpload}>
          <label className={styles.avatarLabel}>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className={styles.avatarInput}
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
                <span className={styles.avatarEditText}>Изменить</span>
              </div>
            </div>
          </label>
        </div>

        {/* Поле для имени */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Имя для отображения</label>
          <input
            type="text"
            name="display_name"
            value={formData.display_name}
            onChange={handleChange}
            placeholder="Введите ваше имя"
            className={styles.input}
          />
        </div>

        {/* Поле для email */}
        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Введите ваш email"
            className={styles.input}
          />
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.buttons}>
          <button 
            type="submit" 
            className={`${styles.button} ${styles.primary}`}
            disabled={isLoading}
          >
            {isLoading ? (
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