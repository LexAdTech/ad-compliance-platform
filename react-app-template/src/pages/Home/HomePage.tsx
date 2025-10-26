import React, { useState, useRef } from 'react';
import { Header } from '../../components/Header/Header';
import SvgIcon from '../../components/Common/SvgIcon';
import { useAuthContext } from '../../contexts/AuthContext';
import { adAnalysisService } from '../../services/adAnalysisService';
import { usePdfExport } from '../../hooks/usePdfExport';
import styles from './HomePage.module.css';
import audioIcon from '../../images/audio_icon.png';

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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isLoggedIn } = useAuthContext();
  const { exportAnalysisToPdf, isGenerating } = usePdfExport();

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      handleAudioAnalysis(file);
    } else if (file) {
      setError('Пожалуйста, выберите аудиофайл');
    }
  };

  const handleAudioAnalysis = async (audioFile: File) => {
    setLoading(true);
    setError(null);
    setCheckResultVisible(false);

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/analyze/audio`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
      } else {
        setAdText(result.converted_text || '');
        setAnalysisResult(result.analysis);
        setCheckResultVisible(true);
        setDetailedTextHidden(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка при анализе аудио');
      setCheckResultVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAudioIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleExportPdf = async () => {
    if (!analysisResult || !adText.trim()) return;

    try {
      await exportAnalysisToPdf({
        title: `Анализ рекламного текста - ${new Date().toLocaleDateString('ru-RU')}`,
        originalText: adText,
        analysis: analysisResult,
        reportType: isLoggedIn ? 'full' : 'short'
      });
    } catch (err) {
      setError('Ошибка при создании PDF');
    }
  };

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

      const result = await adAnalysisService.analyzeAdText(
        adText,
        isLoggedIn ? 'full' : 'short'
      );

      console.log('Analysis completed:', result);

      setAnalysisResult(result.analysis || result.error || 'Анализ завершен');
      setCheckResultVisible(true);
      setDetailedTextHidden(false);
    } catch (err: unknown) {
      console.error('Analysis error:', err);

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
        <div className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Фокс<span className={styles.blue}>Плюс</span>: юридические{' '}
              <span className={styles.orange}>рекомендации</span> по рекламе
            </h1>
            <p className={styles.heroDescription}>
              Сервис для быстрой проверки рекламы на соответствие закону. Мы анализируем текст,
              изображения и аудио с помощью высокотехнологичного алгоритма, находим риски и
              подсказываем, как их исправить. С нами ваша реклама под защитой!
            </p>
          </div>
          <div className={styles.heroImage}>
            <SvgIcon />
          </div>
        </div>

        <section className={styles.checkSection}>
          <div className={styles.titleRow}>
            <div className={styles.checkTitle}>Введите текст Вашей рекламы или загрузите аудиофайл</div>
            <button
              type="button"
              className={styles.audioIcon}
              onClick={handleAudioIconClick}
              disabled={loading}
              title="Загрузить аудио"
            >
              <img src={audioIcon} alt="Загрузить аудио" className={styles.audioIconImage} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAudioUpload}
              accept="audio/*"
              style={{ display: 'none' }}
            />
          </div>
          
          <textarea
            value={adText}
            onChange={(e) => setAdText(e.target.value)}
            rows={4}
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
              <div className={styles.loading}>Идет анализ рекламы...</div>
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
                      <div className={styles.resultHeader}>
                        <h3>Результат анализа:</h3>
                        <button
                          onClick={handleExportPdf}
                          disabled={isGenerating}
                          className={styles.exportPdfButton}
                        >
                          {isGenerating ? 'Создание...' : '📥 PDF'}
                        </button>
                      </div>
                      <p>{analysisResult}</p>
                    </div>
                  )}
                  <div className={styles.resultActions}>
                    <button
                      onClick={() => setDetailedTextHidden(!detailedTextHidden)}
                      className={styles.toggleDetailsButton}
                    >
                      {detailedTextHidden ? 'Показать подробности' : 'Скрыть'}
                    </button>
                    {detailedTextHidden && (
                      <button
                        onClick={handleExportPdf}
                        disabled={isGenerating}
                        className={styles.exportPdfButton}
                      >
                        {isGenerating ? 'Создание PDF...' : '📥 Скачать PDF'}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};