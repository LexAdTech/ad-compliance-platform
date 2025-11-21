import React from 'react';
import styles from './AccessDeniedModal.module.css';

interface AccessDeniedModalProps {
  onClose: () => void;
  onRegister: () => void;
  onLogin: () => void;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({ 
  onClose, 
  onRegister,
  onLogin 
}) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button
          onClick={onClose}
          className={styles.closeButton}
        >
          ×
        </button>
        
        <div className={styles.icon}>🔒</div>
        
        <h2 className={styles.title}>Доступ ограничен</h2>
        
        <p className={styles.message}>
          Пожалуйста, зарегистрируйтесь для доступа к статьям
        </p>
        
        <div className={styles.buttons}>
          <button
            onClick={onRegister}
            className={styles.registerButton}
          >
            Зарегистрироваться
          </button>
          
          <button
            onClick={onLogin}
            className={styles.loginButton}
          >
            Войти
          </button>
        </div>
        
        <p className={styles.note}>
          Уже есть аккаунт?{' '}
          <button 
            onClick={onLogin}
            className={styles.loginLink}
          >
            Войдите
          </button>
        </p>
      </div>
    </div>
  );
};