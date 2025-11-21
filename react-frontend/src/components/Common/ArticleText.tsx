import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Article } from '../../services/ArticleService';
import styles from './ArticleText.module.css';

interface ArticleTextProps {
    articles: Article[];
}

export const ArticleText: React.FC<ArticleTextProps> = ({ articles }) => {
    return (
        <div className={styles.articles}>
            {articles.map((article) => (
                <article key={article.id} className={styles.article}>
                    <h1 className={styles.title}>{article.title}</h1>
                    {/*<div className={styles.meta}>*/}
                    {/*    <time>{new Date(article.createdAt).toLocaleDateString('ru-RU')}</time>*/}
                    {/*</div>*/}
                    <div className={styles.content}>
                        <ReactMarkdown>{article.text}</ReactMarkdown>
                    </div>
                </article>
            ))}
        </div>
    );
};