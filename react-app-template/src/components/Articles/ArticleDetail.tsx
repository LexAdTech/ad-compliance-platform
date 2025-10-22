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

interface MarkdownCodeProps {
    node?: any;
    inline?: boolean;
    className?: string;
    children?: React.ReactNode;
}

interface MarkdownBlockquoteProps {
    node?: any;
    children?: React.ReactNode;
}

interface MarkdownListProps {
    node?: any;
    ordered?: boolean;
    children?: React.ReactNode;
}

interface MarkdownListItemProps {
    node?: any;
    children?: React.ReactNode;
}

// Функция для преобразования текста в правильный Markdown
const preprocessMarkdown = (text: string): string => {
    if (!text) return '';

    return text
        // Заменяем • на стандартные маркеры списка Markdown
        .replace(/•\s+/g, '- ')
        // Заменяем переносы строк с • на элементы списка
        .replace(/\n\s*•/g, '\n-')
        // Обрабатываем нумерованные списки с точками
        .replace(/(\d+)\.\s+/g, '$1. ')
        // Добавляем пробелы после заголовков для лучшего отображения
        .replace(/(#+)([^#\n])/g, '$1 $2')
        // Обрабатываем двойные переносы как новые параграфы
        .replace(/\n\n/g, '\n\n')
        // Обрабатываем одиночные переносы как <br>
        .replace(/\n(?!\n)/g, '  \n');
};

// Компоненты для кастомизации рендеринга Markdown
const MarkdownComponents = {
    // Кастомизация ссылок
    a: ({ node, href, children, ...props }: MarkdownLinkProps) => (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
            {...props}
        >
            {children}
        </a>
    ),
    // Кастомизация блоков кода
    code: ({ node, inline, className, children, ...props }: MarkdownCodeProps) => {
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
    // Кастомизация блоков цитат
    blockquote: ({ node, children, ...props }: MarkdownBlockquoteProps) => (
        <blockquote className={styles.blockquote} {...props}>
            {children}
        </blockquote>
    ),
    // Кастомизация списков
    ul: ({ node, children, ...props }: MarkdownListProps) => (
        <ul className={styles.list} {...props}>
            {children}
        </ul>
    ),
    ol: ({ node, children, ...props }: MarkdownListProps) => (
        <ol className={styles.list} {...props}>
            {children}
        </ol>
    ),
    li: ({ node, children, ...props }: MarkdownListItemProps) => (
        <li className={styles.listItem} {...props}>
            {children}
        </li>
    ),
    // Кастомизация параграфов для лучшего отображения
    p: ({ node, children, ...props }: any) => (
        <p className={styles.paragraph} {...props}>
            {children}
        </p>
    ),
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
                        skipHtml={false}
                    >
                        {processedContent}
                    </ReactMarkdown>
                </div>
            </article>
        </div>
    );
};