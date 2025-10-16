// components/Footer/Footer.tsx
import React from 'react';
import styles from './Footer.module.css';

// Импортируем ту же картинку, что и в хедере
// @ts-ignore
import foxLogo from '../../images/logo2.png';

export const Footer: React.FC = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.logoSection}>
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
                        <p className={styles.description}>
                            Профессиональная проверка рекламы на соответствие законодательству РФ
                        </p>
                    </div>

                    <div className={styles.linksSection}>
                        <div className={styles.linksGroup}>
                            <h4 className={styles.linksTitle}>Навигация</h4>
                            <a href="#" className={styles.link}>Главная</a>
                            <a href="#" className={styles.link}>Статьи</a>
                            <a href="#" className={styles.link}>Контакты</a>
                        </div>

                        <div className={styles.linksGroup}>
                            <h4 className={styles.linksTitle}>Помощь</h4>
                            <a href="#" className={styles.link}>FAQ</a>
                            <a href="#" className={styles.link}>Поддержка</a>
                            <a href="#" className={styles.link}>Документация</a>
                        </div>

                        <div className={styles.linksGroup}>
                            <h4 className={styles.linksTitle}>Правовая информация</h4>
                            <a href="#" className={styles.link}>Политика конфиденциальности</a>
                            <a href="#" className={styles.link}>Пользовательское соглашение</a>
                            <a href="#" className={styles.link}>Оферта</a>
                        </div>
                    </div>
                </div>

                <div className={styles.bottomSection}>
                    <div className={styles.copyright}>
                        © 2024 ФоксПлюс. Все права защищены.
                    </div>
                    <div className={styles.contacts}>
                        <span className={styles.contact}>contact@foxplus.ru</span>
                        <span className={styles.contact}>+7 (999) 123-45-67</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};