// hooks/usePdfExport.ts
import { useState } from 'react';
import { PdfService, PdfContent } from '../services/PdfService';

export const usePdfExport = () => {
    const [isGenerating, setIsGenerating] = useState(false);

    const exportAnalysisToPdf = async (data: Omit<PdfContent, 'timestamp'>) => {
        setIsGenerating(true);
        try {
            const fullContent: PdfContent = {
                ...data,
                timestamp: new Date().toLocaleString('ru-RU', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            // Используем метод с canvas для лучшей поддержки кириллицы
            await PdfService.generateAnalysisPdfWithCanvas(fullContent);
            return true;
        } catch (error) {
            console.error('Ошибка при генерации PDF:', error);

            // Пробуем использовать простой метод как запасной вариант
            try {
                const fullContent: PdfContent = {
                    ...data,
                    timestamp: new Date().toLocaleString('ru-RU', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                };
                await PdfService.generateAnalysisPdf(fullContent);
                return true;
            } catch (fallbackError) {
                console.error('Fallback PDF generation also failed:', fallbackError);
                throw new Error('Не удалось создать PDF файл');
            }
        } finally {
            setIsGenerating(false);
        }
    };

    return {
        exportAnalysisToPdf,
        isGenerating
    };
};