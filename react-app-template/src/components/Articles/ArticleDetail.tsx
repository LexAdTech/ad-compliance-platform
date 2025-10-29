// components/Articles/ArticleDetail.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Article } from '../../types';
import styles from './ArticleDetail.module.css';

interface ArticleDetailProps {
    article: Article;
    onBackClick: () => void;
}

// Типы для компонентов ReactMarkdown
interface MarkdownLinkProps {
    node?: any;
    href?: string;
    children?: React.ReactNode;
}

// Упрощенная функция предобработки - фокусируемся только на основных проблемах
const preprocessMarkdown = (text: string): string => {
    if (!text) return '';

    console.log('Original text:', text); // Для отладки

    let processed = text
        // Сначала обрабатываем основные маркеры списков
        .replace(/^•\s+/gm, '- ')
        .replace(/\n\s*•\s*/g, '\n- ')
        .replace(/^(\d+)\.\s+/gm, '$1. ')
        // Обрабатываем переносы строк
        .replace(/\n\n/g, '\n\n')
        .replace(/\n(?!\n)/g, '  \n');

    // Специальная обработка для проблемных ссылок
    // Ищем паттерны типа ([текст](url)) и исправляем их
    processed = processed.replace(
        /\(\[([^\]]+)\]\(\s*([^)]+)\s*\)\)/g,
        (match, linkText, url) => {
            console.log('Found link:', { match, linkText, url }); // Для отладки
            // Очищаем URL от пробелов и лишних символов
            const cleanedUrl = url
                .replace(/\s+/g, '')
                .replace(/\n/g, '')
                .trim();
            return `([${linkText}](${cleanedUrl}))`;
        }
    );

    console.log('Processed text:', processed); // Для отладки
    return processed;
};

// Компонент для кастомного рендеринга ссылок
const CustomLink = ({ node, href, children, ...props }: MarkdownLinkProps) => {
    // Очищаем URL от возможных пробелов и лишних символов
    const cleanHref = href
        ? href.replace(/\s+/g, '').replace(/\n/g, '').trim()
        : '';

    return (
        <a
            href={cleanHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            {...props}
        >
            {children}
        </a>
    );
};

// Базовые компоненты для Markdown
const MarkdownComponents = {
    a: CustomLink,
    p: ({ node, children, ...props }: any) => (
        <p className={styles.paragraph} {...props}>
            {children}
        </p>
    ),
    ul: ({ node, children, ...props }: any) => (
        <ul className={styles.list} {...props}>
            {children}
        </ul>
    ),
    ol: ({ node, children, ...props }: any) => (
        <ol className={styles.list} {...props}>
            {children}
        </ol>
    ),
    li: ({ node, children, ...props }: any) => (
        <li className={styles.listItem} {...props}>
            {children}
        </li>
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
        if (inline) {
            return <code className={styles.inlineCode} {...props}>{children}</code>;
        }
        return (
            <pre className={styles.codeBlock}>
                <code className={className} {...props}>
                    {children}
                </code>
            </pre>
        );
    },
};

export const ArticleDetail: React.FC<ArticleDetailProps> = ({
                                                                article,
                                                                onBackClick
                                                            }) => {
    const processedContent = preprocessMarkdown(article.text);

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
                            {new Date(article.created_at).toLocaleDateString('ru-RU', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </time>
                    </div>
                </header>

                <div className={styles.content}>
                    <ReactMarkdown
                        components={MarkdownComponents}
                    >
                        {processedContent}
                    </ReactMarkdown>
                </div>
            </article>
        </div>
    );
};