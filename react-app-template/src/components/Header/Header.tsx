import React from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import styles from './Header.module.css';

// @ts-ignore
import foxLogo from '../../images/logo2.png';

interface HeaderProps {
    currentPage: 'home' | 'articles' | 'contact';
    onNavigateHome: () => void;
    onNavigateArticles: () => void;
    onNavigateContact: () => void;
    onLoginClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
                                                  currentPage,
                                                  onNavigateHome,
                                                  onNavigateArticles,
                                                  onNavigateContact,
                                                  onLoginClick,
                                              }) => {
    const { isLoggedIn, logout } = useAuthContext();

    const handleLogout = () => {
        logout();
        onNavigateHome();
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

                <button
                    className={currentPage === 'contact' ? styles.activeButton : styles.navButton}
                    onClick={onNavigateContact}
                >
                    Связаться с нами
                </button>

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