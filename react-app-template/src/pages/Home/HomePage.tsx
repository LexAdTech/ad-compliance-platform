// Файл: ./pages/Home/HomePage.tsx
import React, { useState, useRef } from 'react';
import { Header } from '../../components/Header/Header';
import SvgIcon from '../../components/Common/SvgIcon';
import { useAuthContext } from '../../contexts/AuthContext';
import { adAnalysisService } from '../../services/adAnalysisService';
import { imageAnalysisService } from '../../services/imageAnalysisService';
import { recommendationService } from '../../services/recommendationService';
import { ArticleRecommendations } from '../../components/ArticleRecommendations/ArticleRecommendations';
import { usePdfExport } from '../../hooks/usePdfExport';
import styles from './HomePage.module.css';
import audioIcon from '../../images/audio_icon.png';
import imageIcon from '../../images/image_icon.png';
import { Article } from '../../services/ArticleService';

interface HomePageProps {
  onNavigateArticles: () => void;
  onNavigateContact: () => void;
  onLoginClick: () => void;
  onArticleClick: (articleId: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateArticles,
  onNavigateContact,
  onLoginClick,
  onArticleClick,
}) => {
  const [adText, setAdText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const { isLoggedIn } = useAuthContext();
  const { exportAnalysisToPdf, isGenerating } = usePdfExport();

  // Функция для загрузки рекомендаций
  const loadRecommendations = async (text: string) => {
    if (!text.trim()) return;
    
    setIsLoadingRecommendations(true);
    try {
      const recommendations = await recommendationService.getArticleRecommendations(text);
      setRecommendedArticles(recommendations);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      // Не показываем ошибку пользователю, если рекомендации не загрузились
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  // Обработчик загрузки аудио
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      handleAudioAnalysis(file);
    } else if (file) {
      setError('Пожалуйста, выберите аудиофайл');
    }
  };

  // Обработчик загрузки изображения
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleImageAnalysis(file);
    } else if (file) {
      setError('Пожалуйста, выберите изображение');
    }
  };

  // Анализ аудио
  const handleAudioAnalysis = async (audioFile: File) => {
    setLoading(true);
    setError(null);
    setAnalysisResult('');
    setRecommendedArticles([]);

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
        // Загружаем рекомендации после успешного анализа
        if (result.converted_text) {
          await loadRecommendations(result.converted_text);
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка при анализе аудио');
    } finally {
      setLoading(false);
    }
  };

  // Анализ изображения
  const handleImageAnalysis = async (imageFile: File) => {
    setIsAnalyzingImage(true);
    setError(null);
    setAnalysisResult('');
    setRecommendedArticles([]);

    try {
      const result = await imageAnalysisService.analyzeAdImage(imageFile);
      setAnalysisResult(result.analysis);
      // Для изображений рекомендации не загружаем, так как нет текста
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка при анализе изображения');
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  const handleAudioIconClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageIconClick = () => {
    imageInputRef.current?.click();
  };

  // Экспорт PDF
  const handleExportPdf = async () => {
    if (!analysisResult) return;

    try {
      await exportAnalysisToPdf({
        title: `Анализ рекламы - ${new Date().toLocaleDateString('ru-RU')}`,
        originalText: adText || 'Графическая реклама',
        analysis: analysisResult,
        reportType: isLoggedIn ? 'full' : 'short'
      });
    } catch (err) {
      setError('Ошибка при создании PDF');
    }
  };

  // Анализ текста
  const handleCheck = async () => {
    if (!adText.trim()) {
      setError('Введите текст рекламы для проверки');
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult('');
    setRecommendedArticles([]);

    try {
      const result = await adAnalysisService.analyzeAdText(
        adText,
        isLoggedIn ? 'full' : 'short'
      );

      setAnalysisResult(result.analysis || result.error || 'Анализ завершен');
      
      // Загружаем рекомендации после успешного анализа
      await loadRecommendations(adText);
      
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(`Ошибка: ${err.message}`);
      } else {
        setError('Неизвестная ошибка при анализе текста');
      }
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
        onNavigateContact={onNavigateContact}
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
            <div className={styles.checkTitle}>Введите текст Вашей рекламы или загрузите файл</div>
            <div className={styles.uploadButtons}>
              <button
                type="button"
                className={styles.audioIcon}
                onClick={handleAudioIconClick}
                disabled={loading || isAnalyzingImage}
                title="Загрузить аудио"
              >
                <img src={audioIcon} alt="Загрузить аудио" className={styles.audioIconImage} />
              </button>
              <button
                type="button"
                className={styles.imageIcon}
                onClick={handleImageIconClick}
                disabled={loading || isAnalyzingImage}
                title="Загрузить изображение"
              >
                <img src={imageIcon} alt="Загрузить изображение" className={styles.imageIconImage} />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAudioUpload}
              accept="audio/*"
              style={{ display: 'none' }}
            />
            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
          </div>
          
          <textarea
            value={adText}
            onChange={(e) => setAdText(e.target.value)}
            rows={4}
            className={styles.textarea}
            placeholder="Введите текст рекламы для проверки..."
            disabled={loading || isAnalyzingImage}
          />

          <button
            onClick={handleCheck}
            className={styles.checkButton}
            disabled={loading || isAnalyzingImage || !adText.trim()}
          >
            {loading ? 'Анализ...' : 'Проверить текст'}
          </button>

          {(loading || isAnalyzingImage) && (
            <div className={styles.result}>
              <div className={styles.loading}>
                {loading ? 'Идет анализ текста...' : 'Идет анализ изображения...'}
              </div>
            </div>
          )}

          {error && (
            <div className={styles.result}>
              <div className={styles.errorMessage}>{error}</div>
            </div>
          )}

          {analysisResult && (
            <>
              <div className={styles.result}>
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
                  <div className={styles.analysisText}>
                    {analysisResult.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Блок рекомендаций */}
              <ArticleRecommendations
                articles={recommendedArticles}
                loading={isLoadingRecommendations}
                onArticleClick={onArticleClick}
              />
            </>
          )}
        </section>
      </main>
    </div>
  );
};