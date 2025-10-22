// pages/Articles/ArticlesPage.tsx
import React, { useState, useEffect } from 'react';
import { Header } from '../../components/Header/Header';
import { ArticleList } from '../../components/Articles/ArticleList';
import { ArticleDetail } from '../../components/Articles/ArticleDetail';
import { ArticleService, Article } from '../../services/ArticleService';
import styles from './ArticlesPage.module.css';

interface ArticlesPageProps {
    onNavigateHome: () => void;
    onLoginClick: () => void;
}

type ViewMode = 'list' | 'detail';

export const ArticlesPage: React.FC<ArticlesPageProps> = ({
                                                              onNavigateHome,
                                                              onLoginClick,
                                                          }) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Загрузка списка статей
    useEffect(() => {
        const fetchArticles = async () => {
            try {
                setLoading(true);
                setError(null);
                const articlesData = await ArticleService.getArticles();
                setArticles(articlesData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load articles');
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    // Обработчик клика по статье
    const handleArticleClick = async (articleId: string) => {
        try {
            setLoading(true);
            const article = await ArticleService.getArticleById(articleId);
            setCurrentArticle(article);
            setViewMode('detail');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load article');
        } finally {
            setLoading(false);
        }
    };

    // Обработчик возврата к списку
    const handleBackToList = () => {
        setViewMode('list');
        setCurrentArticle(null);
    };

    return (
        <div className={styles.container}>
            <Header
                currentPage="articles"
                onNavigateHome={onNavigateHome}
                onNavigateArticles={() => {}} // Пустая функция, так как уже на статьях
                onLoginClick={onLoginClick}
            />

            <main className={styles.main}>
                {loading && <div className={styles.loading}>Загрузка...</div>}
                {error && (
                    <div className={styles.error}>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()}>Попробовать снова</button>
                    </div>
                )}

                {!loading && !error && viewMode === 'list' && (
                    <ArticleList
                        articles={articles}
                        onArticleClick={handleArticleClick}
                    />
                )}

                {!loading && !error && viewMode === 'detail' && currentArticle && (
                    <ArticleDetail
                        article={currentArticle}
                        onBackClick={handleBackToList}
                    />
                )}
            </main>
        </div>
    );
};