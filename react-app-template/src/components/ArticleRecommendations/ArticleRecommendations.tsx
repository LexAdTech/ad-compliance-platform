// Файл: ./components/ArticleRecommendations/ArticleRecommendations.tsx
import React from 'react';
import { Article } from '../../services/ArticleService';
import styles from './ArticleRecommendations.module.css';

interface ArticleRecommendationsProps {
    articles: Article[];
    loading?: boolean;
    onArticleClick: (articleId: number) => void; // Меняем string на number
}

export const ArticleRecommendations: React.FC<ArticleRecommendationsProps> = ({
    articles,
    loading = false,
    onArticleClick,
}) => {
    if (loading) {
        return (
            <div className={styles.recommendations}>
                <div className={styles.loading}>Поиск релевантных статей...</div>
            </div>
        );
    }

    if (!articles || articles.length === 0) {
        return (
            <div className={styles.recommendations}>
                <div className={styles.noRecommendations}>
                    <p>Рекомендации появятся здесь после анализа рекламы</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.recommendations}>
            <div className={styles.recommendationsHeader}>
                <div className={styles.recommendationsIcon}>📚</div>
                <h3 className={styles.recommendationsTitle}>Рекомендуемые статьи</h3>
            </div>

            <div className={styles.recommendationsList}>
                {articles.map((article) => (
                    <a
                        key={article.id}
                        href="#"
                        className={styles.recommendationItem}
                        onClick={(e) => {
                            e.preventDefault();
                            onArticleClick(article.id);
                        }}
                    >
                        <h4 className={styles.recommendationTitle}>{article.title}</h4>
                        {article.excerpt && (
                            <p className={styles.recommendationExcerpt}>{article.excerpt}</p>
                        )}
                        <div className={styles.recommendationMeta}>
                            <span>Статья</span>
                            <time>
                                {new Date(article.created_at).toLocaleDateString('ru-RU')}
                            </time>
                        </div>
                    </a>
                ))}
            </div>
        </div>
    );
};