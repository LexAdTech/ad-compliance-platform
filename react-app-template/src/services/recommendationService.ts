// Файл: ./services/recommendationService.ts
import { Article } from './ArticleService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Вспомогательная функция, не экспортируемая из модуля
const generateExcerpt = (text: string, length: number = 150): string => {
    const plainText = text
        .replace(/[#*`\[\]()!]/g, '')
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    return plainText.length > length
        ? plainText.substring(0, length) + '...'
        : plainText;
};

export const recommendationService = {
    async getArticleRecommendations(adText: string): Promise<Article[]> {
        try {
            console.log('Fetching recommendations for text:', adText.substring(0, 100) + '...');

            const response = await fetch(`${API_BASE_URL}/api/recommendations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: adText }),
            });

            console.log('Recommendations response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const articles: Article[] = await response.json();
            console.log('Recommendations received:', articles.length);
            
            // Добавляем excerpt для статей
            return articles.map(article => ({
                ...article,
                excerpt: generateExcerpt(article.text)
            }));
        } catch (error) {
            console.error('Error fetching article recommendations:', error);
            return [];
        }
    }
};