import React, { useState } from 'react';
import { Header } from '../../components/Header/Header';
import SvgIcon from '../../components/Common/SvgIcon';
import { useAuthContext } from '../../contexts/AuthContext';
import { adAnalysisService } from '../../services/adAnalysisService';
import styles from './HomePage.module.css';

interface HomePageProps {
  onNavigateArticles: () => void;
  onLoginClick: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateArticles,
  onLoginClick,
}) => {
  const [adText, setAdText] = useState('');
  const [checkResultVisible, setCheckResultVisible] = useState(false);
  const [detailedTextHidden, setDetailedTextHidden] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isLoggedIn } = useAuthContext();

  const handleCheck = async () => {
    if (!adText.trim()) {
      setError('Введите текст рекламы для проверки');
      return;
    }

    setLoading(true);
    setError(null);
    setCheckResultVisible(false);

    try {
      console.log('Starting analysis...');
      const result = await adAnalysisService.analyzeAdText(adText);
      console.log('Analysis completed:', result);
      
      setAnalysisResult(result.analysis || result.error || 'Анализ завершен');
      setCheckResultVisible(true);
      setDetailedTextHidden(false);
    } catch (err: unknown) {
      console.error('Analysis error:', err);
      
      // Правильная обработка ошибок
      if (err instanceof Error) {
        setError(`Ошибка: ${err.message}`);
      } else {
        setError('Неизвестная ошибка при анализе текста');
      }
      
      setCheckResultVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDetailedResultLogin = () => {
    onLoginClick();
  };

  return (
    <div className={styles.container}>
      <Header
        currentPage="home"
        onNavigateHome={() => {}}
        onNavigateArticles={onNavigateArticles}
        onLoginClick={onLoginClick}
      />

      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Фокс<span className={styles.blue}>Плюс</span>: юридические{' '}
            <span className={styles.orange}>рекомендации</span> по рекламе
          </h1>
          <p className={styles.heroDescription}>
            Сервис для быстрой проверки рекламы на соответствие закону. Мы анализируем текст,
            изображения и аудио с помощью высокотехнологичного алгоритма, находим риски и
            подсказываем, как их исправить. С нами ваша реклама под защитой!
          </p>
          <SvgIcon className={styles.heroImage} />
        </div>

        <section className={styles.checkSection}>
          <div className={styles.checkTitle}>Введите текст вашей рекламы....</div>
          <textarea
            value={adText}
            onChange={(e) => setAdText(e.target.value)}
            rows={5}
            className={styles.textarea}
            placeholder="Введите текст рекламы для проверки..."
            disabled={loading}
          />
          
          <button
            onClick={handleCheck}
            className={styles.checkButton}
            disabled={loading}
          >
            {loading ? 'Анализ...' : 'Проверить'}
          </button>

          {loading && (
            <div className={styles.result}>
              <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                Идет анализ рекламы...
              </div>
            </div>
          )}

          {error && (
            <div className={styles.result}>
              <div className={styles.errorMessage}>{error}</div>
            </div>
          )}

          {checkResultVisible && analysisResult && (
            <div className={styles.result}>
              {!isLoggedIn ? (
                <>
                  <div className={styles.errorMessage}>
                    {analysisResult}
                  </div>
                  <div className={styles.prompt}>
                    Хотите узнать подробнее?
                  </div>
                  <button
                    onClick={handleDetailedResultLogin}
                    className={styles.loginPromptButton}
                  >
                    Войти
                  </button>
                </>
              ) : (
                <>
                  {!detailedTextHidden && (
                    <div className={styles.detailedResult}>
                      <h3>Результат анализа:</h3>
                      <p>{analysisResult}</p>
                    </div>
                  )}
                  <button
                    onClick={() => setDetailedTextHidden(!detailedTextHidden)}
                    className={styles.toggleDetailsButton}
                  >
                    {detailedTextHidden ? 'Показать подробности' : 'Скрыть'}
                  </button>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};