import { useState, useRef } from 'react';
import styles from './AvatarUpload.module.css';

interface AvatarUploadProps {
  currentAvatar?: string;
  onChange: (file: File) => void;
  className?: string;
}

export const AvatarUpload = ({ currentAvatar, onChange, className }: AvatarUploadProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.avatarWrapper} onClick={triggerFileInput}>
        <img 
          src={preview || currentAvatar || '/default-avatar.png'} 
          alt="Аватар" 
          className={styles.avatar}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-avatar.png';
          }}
        />
        <div className={styles.overlay}>
          <span className={styles.overlayText}>Изменить</span>
        </div>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className={styles.fileInput}
      />
    </div>
  );
};