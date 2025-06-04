import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export const NotFoundPage = () => {
  return (
    <div className={styles.container}>
      <h1>404 - Страница не найдена</h1>
      <p>Извините, запрашиваемая страница не существует.</p>
      <Link to="/" className={styles.link}>Вернуться на главную</Link>
    </div>
  );
};
