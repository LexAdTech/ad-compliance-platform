// components/Articles/ArticleList.tsx
import React from 'react';
import { Article } from '../../services/ArticleService';
import styles from './ArticleList.module.css';

interface ArticleListProps {
    articles: Article[];
    onArticleClick: (articleId: string) => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({
                                                            articles,
                                                            onArticleClick
                                                        }) => {
    return (
        <div className={styles.articleList}>
            <h1 className={styles.title}>Статьи</h1>
            <div className={styles.list}>
                {articles.map((article) => (
                    <article
                        key={article.id}
                        className={styles.articleItem}
                        onClick={() => onArticleClick(article.id)}
                    >
                        <h2 className={styles.articleTitle}>{article.title}</h2>
                        {article.excerpt && (
                            <p className={styles.excerpt}>{article.excerpt}</p>
                        )}
                        <div className={styles.meta}>
                            <time className={styles.date}>
                                {new Date(article.created_at).toLocaleDateString('ru-RU')}
                            </time>
                            <span className={styles.readMore}>Читать далее →</span>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
};