import React from 'react';
import styles from './GoodModal.module.css';

interface GoodModalProps {
  onClose: () => void;
  onLogin: () => void;
}

export const GoodModal: React.FC<GoodModalProps> = ({ onClose, onLogin }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <span className={styles.title}>Несоответствие!</span>
        <span className={styles.subtitle}>И вот почему</span>
        <div className={styles.message}>Хотите получить более подробный отчет?</div>
        <button
          onClick={onLogin}
          className={styles.loginButton}
        >
          Войти
        </button>
        <button
          onClick={onClose}
          aria-label="Закрыть"
          className={styles.closeButton}
        >
          ×
        </button>
      </div>
    </div>
  );
};