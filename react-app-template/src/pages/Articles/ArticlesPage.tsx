import React, { useState, useEffect } from 'react';
import { Article } from '../../types/Article';
import { ArticleService } from '../../services/ArticleService';
import { ArticleCard } from '../../components/ArticleCard/ArticleCard';
import { ArticleTable } from '../../components/ArticleTable/ArticleTable';
import { ViewModeToggle } from '../../components/ViewModeToggle/ViewModeToggle';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import './ArticlesPage.scss';

type ViewMode = 'list' | 'table';

export const ArticlesPage: React.FC = () => {
    const [articles, setArticles] = useState<Article[]>([]);
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

                // Сортировка статей по дате создания (сначала новые)
                const sortedArticles = articlesData.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                setArticles(sortedArticles);
            } catch (err) {
                setError('Ошибка при загрузке статей');
                console.error('Error fetching articles:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <ErrorMessage message={error} />;
    }

    return (
        <div className="articles-page">
            <div className="articles-page__header">
                <h1 className="articles-page__title">Статьи</h1>
                <ViewModeToggle
                    currentMode={viewMode}
                    onModeChange={handleViewModeChange}
                />
            </div>

            <div className="articles-page__content">
                {viewMode === 'list' ? (
                    <div className="articles-list">
                        {articles.map((article) => (
                            <ArticleCard
                                key={article.id}
                                article={article}
                            />
                        ))}
                    </div>
                ) : (
                    <ArticleTable articles={articles} />
                )}
            </div>
        </div>
    );
};
