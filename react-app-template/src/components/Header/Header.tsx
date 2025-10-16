import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import styles from './Header.module.css';

// Импортируем картинку (предполагаем, что она лежит в папке images)
// @ts-ignore
import foxLogo from '../../images/logo2.png';

interface HeaderProps {
  currentPage: 'home' | 'articles';
  onNavigateHome: () => void;
  onNavigateArticles: () => void;
  onLoginClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
                                                currentPage,
                                                onNavigateHome,
                                                onNavigateArticles,
                                                onLoginClick,
                                              }) => {
  const { isLoggedIn, logout } = useAuthContext();

  const handleLogout = () => {
    logout();
    onNavigateHome(); // После выхода возвращаем на главную
  };

  const handleArticlesClick = () => {
    if (isLoggedIn) {
      onNavigateArticles();
    } else {
      onNavigateArticles(); // App.tsx проверит авторизацию и покажет модальное окно
    }
  };

  return (
      <header className={styles.header}>
        <div className={styles.logo}>
          <img
              src={foxLogo}
              alt="Fox Plus Logo"
              className={styles.logoImage}
          />
          <span className={styles.title}>
          <span className={styles.fox}>Фокс</span>
          <span className={styles.plus}>Плюс</span>
        </span>
        </div>

        <nav className={styles.nav}>
          <button
              className={currentPage === 'home' ? styles.activeButton : styles.navButton}
              onClick={onNavigateHome}
          >
            Проверка рекламы
          </button>

          <button
              className={currentPage === 'articles' ? styles.activeButton : styles.navButton}
              onClick={handleArticlesClick}
          >
            Статьи
          </button>

          <button className={styles.navButton}>Связаться с нами</button>
          <button className={styles.navButton}>Ссылки</button>

          {isLoggedIn ? (
              <button
                  className={styles.authButton}
                  onClick={handleLogout}
              >
                Выйти
              </button>
          ) : (
              <button
                  className={styles.authButton}
                  onClick={onLoginClick}
              >
                Войти
              </button>
          )}
        </nav>
      </header>
  );
};