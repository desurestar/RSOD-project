import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../api/types';
import styles from './UserCardMini.module.css';

interface UserCardProps {
  user: User;
  onUnsubscribe?: (id: number) => void;
  variant?: 'mini' | 'default';
}

export const UserCardMini: React.FC<UserCardProps> = ({ 
  user, 
  onUnsubscribe, 
  variant = 'default' 
}) => {
  return (
    <div className={`${styles.card} ${variant === 'mini' ? styles.mini : ''}`}>
      <Link to={`/profile/${user.id}`} className={styles.userLink}>
        <div className={styles.avatarContainer}>
          <img
            src={user.avatar_url || '/default-avatar.png'}
            alt={user.username}
            className={styles.avatar}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
        </div>
        <div className={styles.userInfo}>
          <h4 className={styles.displayName}>
            {user.display_name || user.username}
          </h4>
          <p className={styles.username}>@{user.username}</p>
          {variant === 'default' && user.email && (
            <p className={styles.email}>{user.email}</p>
          )}
        </div>
      </Link>
      
      {onUnsubscribe && (
        <button
          className={styles.unsubscribeBtn}
          onClick={() => onUnsubscribe(user.id)}
        >
          Отписаться
        </button>
      )}
    </div>
  );
};