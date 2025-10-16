// services/articleService.ts
export interface Article {
    id: string;
    title: string;
    text: string;
    created_at: string;
    excerpt?: string; // краткое описание для списка
}

export const articleService = {
    async getArticles(): Promise<Article[]> {
        try {
            const response = await fetch('http://localhost:8080/articles/');
            if (!response.ok) {
                throw new Error('Failed to fetch articles');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching articles:', error);
            throw error;
        }
    },

    async getArticleById(id: string): Promise<Article> {
        try {
            const response = await fetch(`http://localhost:8080/articles/${id}`);
            if (!response.ok) {
                throw new Error('Failed to fetch article');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching article:', error);
            throw error;
        }
    }
};