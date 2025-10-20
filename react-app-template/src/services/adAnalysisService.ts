// services/adAnalysisService.ts

export interface AnalysisResult {
    analysis: string;
    error?: string;
}

export const adAnalysisService = {
    async analyzeAdText(text: string, reportType: 'short' | 'full' = 'short'): Promise<AnalysisResult> {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
            
            console.log('Sending text to analysis:', text);
            console.log('Report type:', reportType);
            console.log('API URL:', `${API_BASE_URL}/api/analyze`);
            
            // Создаем объект с текстом и типом отчета
            const requestBody = JSON.stringify({
                text: text,
                report_type: reportType
            });

            const response = await fetch(`${API_BASE_URL}/api/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: requestBody,
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                let errorText;
                try {
                    errorText = await response.text();
                } catch {
                    errorText = `HTTP error! status: ${response.status}`;
                }
                console.error('Server error:', errorText);
                throw new Error(errorText);
            }

            try {
                const result = await response.json();
                console.log('Analysis result:', result);
                return result;
            } catch (jsonError) {
                console.error('JSON parse error:', jsonError);
                const textResult = await response.text();
                return { analysis: textResult };
            }
        } catch (error) {
            console.error('Fetch error:', error);
            
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                throw new Error('Не удалось подключиться к серверу. Убедитесь, что бэкенд запущен на localhost:8080');
            }
            
            if (error instanceof Error) {
                throw new Error(error.message || 'Неизвестная ошибка при анализе текста');
            }
            
            throw new Error('Неизвестная ошибка при анализе текста');
        }
    },
};