import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Article } from '../../services/ArticleService';
import styles from './ArticleDetail.module.css';

interface ArticleDetailProps {
    article: Article;
    onBackClick: () => void;
}

// Функция для предварительной обработки текста
const preprocessContent = (content: string): string => {
    // Заменяем • на стандартные маркеры списка
    return content
        .replace(/•\s+/g, '- ')
        .replace(/\n\s*•/g, '\n-');
};

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
                                                                article,
                                                                onBackClick
                                                            }) => {
    const processedContent = preprocessContent(article.text);

    return (
        <div className={styles.articleDetail}>
            <button className={styles.backButton} onClick={onBackClick}>
                ← Назад к списку статей
            </button>

            <article className={styles.article}>
                <header className={styles.header}>
                    <h1 className={styles.title}>{article.title}</h1>
                    <div className={styles.meta}>
                        <time className={styles.date}>
                            {new Date(article.created_at).toLocaleDateString('ru-RU')}
                        </time>
                    </div>
                </header>

                <div className={styles.content}>
                    <ReactMarkdown
                        components={{
                            ul: ({node, ...props}) => <ul className={styles.customList} {...props} />,
                            ol: ({node, ...props}) => <ol className={styles.customList} {...props} />,
                            li: ({node, ...props}) => <li className={styles.listItem} {...props} />
                        }}
                    >
                        {processedContent}
                    </ReactMarkdown>
                </div>
            </article>
        </div>
    );
};