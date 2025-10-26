import { Article } from '../types';

export class ArticleService {
    private static readonly API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

    private static generateExcerpt(markdown: string, length: number = 150): string {
        const plainText = markdown
            .replace(/[#*`\[\]()!]/g, '')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        return plainText.length > length
            ? plainText.substring(0, length) + '...'
            : plainText;
    }

    static async getArticles(): Promise<Article[]> {
        try {
            console.log('Fetching articles from:', `${this.API_BASE_URL}/articles/`);

            const response = await fetch(`${this.API_BASE_URL}/articles/`);

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const articles: Article[] = await response.json();
            console.log('Articles received:', articles);

            return articles.map(article => ({
                ...article,
                excerpt: this.generateExcerpt(article.text)
            }));
        } catch (error) {
            console.error('Error fetching articles:', error);
            throw new Error(`Не удалось загрузить статьи: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static async getArticleById(id: string): Promise<Article> {
        try {
            console.log('Fetching article from:', `${this.API_BASE_URL}/articles/${id}`);

            const response = await fetch(`${this.API_BASE_URL}/articles/${id}`);

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const article: Article = await response.json();
            console.log('Article received:', article);

            return article;
        } catch (error) {
            console.error('Error fetching article:', error);
            throw new Error(`Не удалось загрузить статью: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export type { Article };