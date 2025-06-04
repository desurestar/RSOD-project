import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  fullPage?: boolean;
}

export const LoadingSpinner = ({ fullPage = false }: LoadingSpinnerProps) => {
  return (
    <div className={`${styles.spinnerContainer} ${fullPage ? styles.fullPage : ''}`}>
      <div className={styles.spinner}></div>
    </div>
  );
};