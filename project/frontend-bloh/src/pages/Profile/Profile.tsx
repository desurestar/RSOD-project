import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Footer } from '../../components/Footer/Footer';
import { Header } from '../../components/Heared/Header';
import { MiniPostCard } from '../../components/MiniPostCard/MiniPostCard';
import { useAuthStore } from '../../stores/authStore';
import { useProfileStore } from '../../stores/profileStore';
import styles from './Profile.module.css';
import Modal from 'react-modal';
import { FaEdit, FaUserPlus, FaUserMinus } from 'react-icons/fa';

Modal.setAppElement('#root');

export const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user: currentUser, followUser, unfollowUser } = useAuthStore();
  const {
    profile,
    posts,
    likedPosts,
    followers,
    following,
    loading,
    error,
    fetchProfile,
    fetchPosts,
    fetchLikedPosts,
    fetchFollowers,
    fetchFollowing,
    updateProfile,
    uploadAvatar,
  } = useProfileStore();
  
  const [activeTab, setActiveTab] = useState<'followers' | 'following' | 'posts' | 'liked'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    display_name: '',
    bio: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Проверяем, является ли текущий профиль профилем авторизованного пользователя
  const isOwnProfile = currentUser?.username === username;

  // Загружаем данные профиля при монтировании и изменении username
  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }

    fetchProfile(username);
    fetchPosts(username);
  }, [username, fetchProfile, fetchPosts, navigate]);

  // Загружаем дополнительные данные при смене таба
  useEffect(() => {
    if (!username) return;

    switch (activeTab) {
      case 'liked':
        fetchLikedPosts(username);
        break;
      case 'followers':
        fetchFollowers(username);
        break;
      case 'following':
        fetchFollowing(username);
        break;
      default:
        break;
    }
  }, [activeTab, username, fetchLikedPosts, fetchFollowers, fetchFollowing]);

  // Инициализируем данные для редактирования
  useEffect(() => {
    if (profile && isEditing) {
      setEditData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
      });
    }
  }, [profile, isEditing]);

  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    try {
      await updateProfile(editData);
      
      if (avatarFile) {
        await uploadAvatar(avatarFile);
        setAvatarFile(null);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFollow = async () => {
    if (!profile || !currentUser) return;
    
    try {
      if (profile.is_following) {
        await unfollowUser(profile.username);
      } else {
        await followUser(profile.username);
      }
      
      // Обновляем данные профиля
      fetchProfile(profile.username);
      fetchFollowers(profile.username);
    } catch (error) {
      console.error('Follow error:', error);
    }
  };

  if (loading && !profile) {
    return (
      <div className={styles.loading}>
        <Header />
        <div className={styles.spinner}></div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <Header />
        <div className={styles.errorMessage}>{error}</div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.notFound}>
        <Header />
        <div className={styles.notFoundMessage}>Профиль не найден</div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className={styles.profilePage}>
        <div className={styles.card}>
          <div className={styles.avatarContainer}>
            <img
              className={styles.avatar}
              src={
                avatarFile 
                  ? URL.createObjectURL(avatarFile) 
                  : profile.avatar_url || '/default-avatar.png'
              }
              alt='avatar'
            />
            {isOwnProfile && isEditing && (
              <button 
                className={styles.avatarEditButton}
                onClick={triggerFileInput}
              >
                <FaEdit />
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className={styles.editForm}>
              <input
                type="text"
                value={editData.display_name}
                onChange={(e) => setEditData({...editData, display_name: e.target.value})}
                placeholder="Имя"
                className={styles.editInput}
              />
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({...editData, bio: e.target.value})}
                placeholder="О себе"
                className={styles.editTextarea}
                rows={3}
              />
              <div className={styles.editButtons}>
                <button 
                  className={styles.saveButton}
                  onClick={handleSaveProfile}
                  disabled={loading}
                >
                  Сохранить
                </button>
                <button 
                  className={styles.cancelButton}
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Отмена
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className={styles.name}>{profile.display_name || profile.username}</h2>
              <div className={styles.username}>@{profile.username}</div>
              {profile.bio && <div className={styles.bio}>{profile.bio}</div>}
              
              <div className={styles.actions}>
                {isOwnProfile ? (
                  <button 
                    className={styles.editButton}
                    onClick={handleEditClick}
                  >
                    <FaEdit /> Редактировать профиль
                  </button>
                ) : (
                  <button
                    className={profile.is_following ? styles.unfollowButton : styles.followButton}
                    onClick={handleFollow}
                    disabled={loading}
                  >
                    {profile.is_following ? (
                      <>
                        <FaUserMinus /> Отписаться
                      </>
                    ) : (
                      <>
                        <FaUserPlus /> Подписаться
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <div className={styles.stats}>
          <div 
            className={`${styles.statItem} ${activeTab === 'followers' ? styles.active : ''}`}
            onClick={() => handleTabClick('followers')}
          >
            <span>Подписчики</span>
            <strong>{profile.followers_count || 0}</strong>
          </div>
          <div 
            className={`${styles.statItem} ${activeTab === 'following' ? styles.active : ''}`}
            onClick={() => handleTabClick('following')}
          >
            <span>Подписки</span>
            <strong>{profile.following_count || 0}</strong>
          </div>
          <div 
            className={`${styles.statItem} ${activeTab === 'posts' ? styles.active : ''}`}
            onClick={() => handleTabClick('posts')}
          >
            <span>Посты</span>
            <strong>{profile.posts_count || 0}</strong>
          </div>
          <div 
            className={`${styles.statItem} ${activeTab === 'liked' ? styles.active : ''}`}
            onClick={() => handleTabClick('liked')}
          >
            <span>Понравилось</span>
            <strong>{profile.liked_posts_count || 0}</strong>
          </div>
        </div>

        <div className={styles.tabContent}>
          {activeTab === 'followers' && (
            <>
              <h3 className={styles.tabTitle}>Подписчики</h3>
              {followers.length > 0 ? (
                <ul className={styles.list}>
                  {followers.map(follower => (
                    <li key={follower.id} className={styles.userItem}>
                      <img 
                        src={follower.avatar_url || '/default-avatar.png'} 
                        alt={follower.username} 
                        className={styles.userAvatar}
                      />
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>
                          {follower.display_name || follower.username}
                        </span>
                        <span className={styles.userUsername}>
                          @{follower.username}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.emptyMessage}>
                  {isOwnProfile 
                    ? 'У вас пока нет подписчиков.' 
                    : 'У пользователя пока нет подписчиков.'}
                </div>
              )}
            </>
          )}

          {activeTab === 'following' && (
            <>
              <h3 className={styles.tabTitle}>Подписки</h3>
              {following.length > 0 ? (
                <ul className={styles.list}>
                  {following.map(user => (
                    <li key={user.id} className={styles.userItem}>
                      <img 
                        src={user.avatar_url || '/default-avatar.png'} 
                        alt={user.username} 
                        className={styles.userAvatar}
                      />
                      <div className={styles.userInfo}>
                        <span className={styles.userName}>
                          {user.display_name || user.username}
                        </span>
                        <span className={styles.userUsername}>
                          @{user.username}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={styles.emptyMessage}>
                  {isOwnProfile 
                    ? 'Вы ни на кого не подписаны.' 
                    : 'Пользователь ни на кого не подписан.'}
                </div>
              )}
            </>
          )}

          {activeTab === 'posts' && (
            <>
              <h3 className={styles.tabTitle}>Посты</h3>
              {posts.length > 0 ? (
                <div className={styles.postsGrid}>
                  {posts.map(post => (
                    <MiniPostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyMessage}>
                  {isOwnProfile 
                    ? 'У вас пока нет постов.' 
                    : 'У пользователя пока нет постов.'}
                </div>
              )}
            </>
          )}

          {activeTab === 'liked' && (
            <>
              <h3 className={styles.tabTitle}>Понравившиеся посты</h3>
              {likedPosts.length > 0 ? (
                <div className={styles.postsGrid}>
                  {likedPosts.map(post => (
                    <MiniPostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyMessage}>
                  {isOwnProfile 
                    ? 'Вы еще не лайкнули ни одного поста.' 
                    : 'Пользователь еще не лайкнул ни одного поста.'}
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};