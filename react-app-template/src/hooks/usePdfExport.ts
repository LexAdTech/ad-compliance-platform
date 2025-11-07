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

            console.log('Starting PDF generation with content:', {
                title: fullContent.title,
                originalTextLength: fullContent.originalText?.length,
                analysisLength: fullContent.analysis?.length,
                reportType: fullContent.reportType
            });

            // Пробуем основной метод
            await PdfService.generatePdf(fullContent);
            console.log('PDF generated successfully');
            return true;
        } catch (error) {
            console.error('Main PDF generation failed:', error);

            // Пробуем запасные методы
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

                console.log('Trying fallback PDF generation method...');

                // Пробуем альтернативный метод
                await PdfService.generateAnalysisPdf(fullContent);
                console.log('Fallback PDF generation successful');
                return true;
            } catch (fallbackError) {
                console.error('All PDF generation methods failed:', fallbackError);

                // Последняя попытка - самый простой метод
                try {
                    const fullContent: PdfContent = {
                        ...data,
                        timestamp: new Date().toLocaleString('ru-RU')
                    };

                    await PdfService.generateSimplePdf(fullContent);
                    console.log('Simple PDF generation successful');
                    return true;
                } catch (finalError) {
                    console.error('Final PDF generation attempt failed:', finalError);
                    throw new Error('Не удалось создать PDF файл. Пожалуйста, попробуйте еще раз.');
                }
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