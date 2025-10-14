import React, { useState } from 'react';
import { useAuthContext } from '../../contexts/AuthContext';
import { AuthMode } from '../../types';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  mode,
  setMode,
  onClose,
  onLoginSuccess,
}) => {
  const { login, register, loading, error, setError } = useAuthContext();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (mode === 'register') {
        const user = await register({ username, email, password });
        alert(`Пользователь ${user.username} успешно зарегистрирован!`);
        setMode('login');
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        const token = await login({ username, password });
        alert(`Успешный вход!`);
        onLoginSuccess();
      }
    } catch (err) {
      // Ошибка уже обработана в хуке
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>×</button>
        
        <h2 className={styles.title}>
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <>
              <label htmlFor="username">Имя пользователя</label>
              <input
                id="username"
                type="text"
                value={username}
                required
                autoFocus
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
              />
              
              <label htmlFor="email">Почта</label>
              <input
                id="email"
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
            </>
          )}
          
          {mode === 'login' && (
            <>
              <label htmlFor="username">Имя пользователя</label>
              <input
                id="username"
                type="text"
                value={username}
                required
                autoFocus
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
              />
            </>
          )}
          
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Загрузка...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>
        
        {error && <div className={styles.error}>{error}</div>}
        
        <div className={styles.switchMode}>
          {mode === 'login' ? (
            <>Нет аккаунта?{' '}
              <button 
                onClick={() => switchMode('register')}
                className={styles.switchButton}
              >
                Зарегистрироваться
              </button>
            </>
          ) : (
            <>Есть аккаунт?{' '}
              <button 
                onClick={() => switchMode('login')}
                className={styles.switchButton}
              >
                Войти
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};