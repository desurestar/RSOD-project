import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { MiniPostCard } from '../../components/MiniPostCard/MiniPostCard';
import { UserCardMini } from '../../components/UserCardMini/UserCardMini';
import { useAuthStore } from '../../stores/authStore';
import { blogAPI } from '../../api/blog';
import { authAPI } from '../../api/auth';
import styles from './Profile.module.css';

export const Profile: React.FC = () => {
  const { user, fetchProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'followers' | 'following' | 'posts' | 'liked' | null>(null);
  const [tabData, setTabData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (!activeTab || !user) return;
    
    const fetchTabData = async () => {
      setLoading(true);
      try {
        let data = [];
        switch (activeTab) {
          case 'posts':
            data = await blogAPI.getPosts({ author: user.id });
            break;
          case 'liked':
            data = await blogAPI.getPosts({ liked_by: user.id });
            break;
          case 'followers':
            data = await authAPI.getFollowers(user.id);
            break;
          case 'following':
            data = await authAPI.getFollowing(user.id);
            break;
          default:
            break;
        }
        setTabData(data);
      } catch (error) {
        console.error('Error fetching tab data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTabData();
  }, [activeTab, user]);

  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(prev => (prev === tab ? null : tab));
  };

  const handleUnsubscribe = async (userId: number) => {
    try {
      await authAPI.unsubscribe(userId);
      if (activeTab === 'following') {
        setTabData(prev => prev.filter(user => user.id !== userId));
      }
      fetchProfile();
    } catch (error) {
      console.error('Unsubscribe error:', error);
    }
  };

  if (!user) return <div className={styles.loading}>Загрузка профиля...</div>;

  return (
    <>
      <div className={styles.profileContainer}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarWrapper}>
            <img
              src={user.avatar_url || '/default-avatar.png'}
              alt="Аватар"
              className={styles.avatar}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/default-avatar.png';
              }}
            />
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.displayName}>{user.display_name || user.username}</h1>
            <p className={styles.username}>@{user.username}</p>
            <p className={styles.email}>{user.email}</p>
            <Link to="/profile/edit" className={styles.editButton}>
              Редактировать профиль
            </Link>
          </div>
        </div>

        <div className={styles.statsContainer}>
          <div 
            className={`${styles.statItem} ${activeTab === 'followers' ? styles.active : ''}`}
            onClick={() => handleTabClick('followers')}
          >
            <span className={styles.statNumber}>{user.subscribers_count || 0}</span>
            <span className={styles.statLabel}>Подписчики</span>
          </div>
          <div 
            className={`${styles.statItem} ${activeTab === 'following' ? styles.active : ''}`}
            onClick={() => handleTabClick('following')}
          >
            <span className={styles.statNumber}>{user.subscriptions_count || 0}</span>
            <span className={styles.statLabel}>Подписки</span>
          </div>
          <div 
            className={`${styles.statItem} ${activeTab === 'posts' ? styles.active : ''}`}
            onClick={() => handleTabClick('posts')}
          >
            <span className={styles.statNumber}>{user.posts_count || 0}</span>
            <span className={styles.statLabel}>Посты</span>
          </div>
          <div 
            className={`${styles.statItem} ${activeTab === 'liked' ? styles.active : ''}`}
            onClick={() => handleTabClick('liked')}
          >
            <span className={styles.statNumber}>{user.liked_posts_count || 0}</span>
            <span className={styles.statLabel}>Лайки</span>
          </div>
        </div>

        {activeTab && (
          <div className={styles.tabContent}>
            <h2 className={styles.tabTitle}>
              {activeTab === 'followers' && 'Подписчики'}
              {activeTab === 'following' && 'Подписки'}
              {activeTab === 'posts' && 'Мои посты'}
              {activeTab === 'liked' && 'Понравившиеся посты'}
            </h2>
            
            {loading ? (
              <div className={styles.loading}>Загрузка...</div>
            ) : (
              <div className={styles.tabList}>
                {tabData.length === 0 ? (
                  <div className={styles.emptyMessage}>
                    {activeTab === 'followers' && 'У вас пока нет подписчиков'}
                    {activeTab === 'following' && 'Вы ни на кого не подписаны'}
                    {activeTab === 'posts' && 'У вас пока нет постов'}
                    {activeTab === 'liked' && 'Вы еще не лайкнули ни одного поста'}
                  </div>
                ) : (
                  tabData.map(item => (
                    <div key={item.id} className={styles.tabItem}>
                      {activeTab === 'posts' || activeTab === 'liked' ? (
                        <MiniPostCard post={item} />
                      ) : (
                        <UserCardMini 
                          user={item} 
                          variant="mini"
                          onUnsubscribe={activeTab === 'following' ? handleUnsubscribe : undefined}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};