// services/PdfService.ts
import jsPDF from 'jspdf';

declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
    }
}

export interface PdfContent {
    title: string;
    originalText: string;
    analysis: string;
    reportType: 'short' | 'full';
    timestamp: string;
}

export class PdfService {
    // ОСНОВНОЙ ИСПРАВЛЕННЫЙ МЕТОД - с правильным переносом страниц
    static async generateAnalysisPdf(content: PdfContent): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const pdf = new jsPDF();
                const margin = 20;
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                let yPosition = margin;
                const lineHeight = 6;

                // Функция для очистки текста
                const cleanText = (text: string): string => {
                    if (!text) return '';
                    return text
                        .replace(/[^\x20-\x7E\xA0-\xFF\u0400-\u04FF\n\r\t]/g, '')
                        .replace(/null/gi, '')
                        .replace(/\n{3,}/g, '\n\n')
                        .replace(/[ \t]{2,}/g, ' ')
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .join('\n')
                        .trim();
                };

                // Функция для добавления текста с автоматическим переносом страниц
                const addTextWithPagination = (
                    text: string,
                    fontSize: number = 10,
                    isBold: boolean = false,
                    color?: number[],
                    extraSpacing: number = 0
                ): void => {
                    if (color) {
                        pdf.setTextColor(color[0], color[1], color[2]);
                    }

                    pdf.setFontSize(fontSize);
                    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

                    const maxWidth = pageWidth - 2 * margin;
                    const cleanedText = cleanText(text);
                    const lines = pdf.splitTextToSize(cleanedText, maxWidth);

                    for (const line of lines) {
                        // Проверяем, не вышли ли за границы страницы
                        if (yPosition + lineHeight > pageHeight - margin) {
                            pdf.addPage();
                            yPosition = margin;
                        }

                        pdf.text(line, margin, yPosition);
                        yPosition += lineHeight;
                    }

                    yPosition += extraSpacing;
                };

                // Заголовок документа
                addTextWithPagination('Анализ рекламного текста', 16, true, [21, 114, 255], 10);

                // Мета-информация
                addTextWithPagination(`Заголовок: ${content.title}`, 10, false, [44, 62, 80]);
                addTextWithPagination(`Тип отчета: ${content.reportType === 'short' ? 'Краткий' : 'Полный'}`, 10, false, [44, 62, 80]);
                addTextWithPagination(`Дата анализа: ${content.timestamp}`, 10, false, [44, 62, 80], 15);

                // Оригинальный текст
                addTextWithPagination('Исходный текст:', 11, true, [255, 127, 50], 8);
                addTextWithPagination(content.originalText, 10, false, [44, 62, 80], 15);

                // Результаты анализа
                addTextWithPagination('Результаты анализа:', 11, true, [21, 114, 255], 8);
                addTextWithPagination(content.analysis, 10, false, [44, 62, 80]);

                // Сохраняем PDF
                const fileName = `анализ_${this.fixFileName(content.title)}_${Date.now()}.pdf`;
                pdf.save(fileName);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    // АЛЬТЕРНАТИВНЫЙ МЕТОД с использованием autoTable для лучшего форматирования
    static async generateAnalysisPdfWithCanvas(content: PdfContent): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const pdf = new jsPDF();
                const margin = 20;
                const pageWidth = pdf.internal.pageSize.getWidth();
                let yPosition = 20;

                // Функция для очистки текста
                const cleanText = (text: string): string => {
                    if (!text) return '';
                    return text
                        .replace(/[^\x20-\x7E\xA0-\xFF\u0400-\u04FF\n\r\t]/g, '')
                        .replace(/null/gi, '')
                        .replace(/\n{3,}/g, '\n\n')
                        .replace(/[ \t]{2,}/g, ' ')
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .join('\n')
                        .trim();
                };

                // Добавление текста с переносом страниц
                const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10, isBold: boolean = false): number => {
                    pdf.setFontSize(fontSize);
                    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

                    const lines = pdf.splitTextToSize(text, maxWidth);
                    let currentY = y;

                    for (let i = 0; i < lines.length; i++) {
                        // Проверка на необходимость новой страницы
                        if (currentY > pdf.internal.pageSize.getHeight() - 20) {
                            pdf.addPage();
                            currentY = 20;
                        }
                        pdf.text(lines[i], x, currentY);
                        currentY += 7;
                    }

                    return currentY;
                };

                // Заголовок
                pdf.setTextColor(21, 114, 255);
                yPosition = addText('Анализ рекламного текста', margin, yPosition, pageWidth - 2 * margin, 16, true) + 10;

                // Мета-информация
                pdf.setTextColor(44, 62, 80);
                yPosition = addText(`Заголовок: ${cleanText(content.title)}`, margin, yPosition, pageWidth - 2 * margin, 10, false) + 5;
                yPosition = addText(`Тип отчета: ${content.reportType === 'short' ? 'Краткий' : 'Полный'}`, margin, yPosition, pageWidth - 2 * margin, 10, false) + 5;
                yPosition = addText(`Дата анализа: ${cleanText(content.timestamp)}`, margin, yPosition, pageWidth - 2 * margin, 10, false) + 15;

                // Оригинальный текст
                pdf.setTextColor(255, 127, 50);
                yPosition = addText('Исходный текст:', margin, yPosition, pageWidth - 2 * margin, 11, true) + 8;

                pdf.setTextColor(44, 62, 80);
                yPosition = addText(cleanText(content.originalText), margin, yPosition, pageWidth - 2 * margin, 10, false) + 15;

                // Результаты анализа
                pdf.setTextColor(21, 114, 255);
                yPosition = addText('Результаты анализа:', margin, yPosition, pageWidth - 2 * margin, 11, true) + 8;

                pdf.setTextColor(44, 62, 80);
                addText(cleanText(content.analysis), margin, yPosition, pageWidth - 2 * margin, 10, false);

                // Сохраняем PDF
                const fileName = `анализ_${this.fixFileName(content.title)}_${Date.now()}.pdf`;
                pdf.save(fileName);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    // ПРОСТОЙ И НАДЕЖНЫЙ МЕТОД (основной рекомендуемый)
    static async generateUniversalPdf(content: PdfContent): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                const pdf = new jsPDF();
                const margin = 20;
                const pageWidth = pdf.internal.pageSize.getWidth();
                const pageHeight = pdf.internal.pageSize.getHeight();

                let yPosition = margin;

                // Функция для очистки текста
                const cleanText = (text: string): string => {
                    if (!text) return '';
                    return text
                        .replace(/[^\x20-\x7E\xA0-\xFF\u0400-\u04FF\n\r\t]/g, '')
                        .replace(/null/gi, '')
                        .replace(/\n{3,}/g, '\n\n')
                        .replace(/[ \t]{2,}/g, ' ')
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0)
                        .join('\n')
                        .trim();
                };

                // Улучшенная функция добавления текста
                const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color?: number[]): void => {
                    if (color) {
                        pdf.setTextColor(color[0], color[1], color[2]);
                    } else {
                        pdf.setTextColor(0, 0, 0); // черный по умолчанию
                    }

                    pdf.setFontSize(fontSize);
                    pdf.setFont('helvetica', isBold ? 'bold' : 'normal');

                    const maxWidth = pageWidth - 2 * margin;
                    const cleanedText = cleanText(text);
                    const lines = pdf.splitTextToSize(cleanedText, maxWidth);

                    for (let i = 0; i < lines.length; i++) {
                        // Проверяем границы страницы
                        if (yPosition > pageHeight - margin) {
                            pdf.addPage();
                            yPosition = margin;
                        }

                        pdf.text(lines[i], margin, yPosition);
                        yPosition += 7; // межстрочный интервал
                    }

                    // Добавляем отступ после блока
                    yPosition += 5;
                };

                // Заголовок
                addText('Анализ рекламного текста', 16, true, [21, 114, 255]);
                yPosition += 5;

                // Мета-информация
                addText(`Заголовок: ${content.title}`, 10, false, [44, 62, 80]);
                addText(`Тип отчета: ${content.reportType === 'short' ? 'Краткий' : 'Полный'}`, 10, false, [44, 62, 80]);
                addText(`Дата анализа: ${content.timestamp}`, 10, false, [44, 62, 80]);
                yPosition += 10;

                // Оригинальный текст
                addText('Исходный текст:', 12, true, [255, 127, 50]);
                addText(content.originalText, 10, false, [44, 62, 80]);
                yPosition += 10;

                // Результаты анализа
                addText('Результаты анализа:', 12, true, [21, 114, 255]);
                addText(content.analysis, 10, false, [44, 62, 80]);

                // Сохраняем PDF
                const fileName = `анализ_${this.fixFileName(content.title)}_${Date.now()}.pdf`;
                pdf.save(fileName);
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    // ОСНОВНОЙ МЕТОД ДЛЯ ИСПОЛЬЗОВАНИЯ В ХУКЕ
    static async generatePdf(content: PdfContent): Promise<void> {
        // Используем универсальный метод как основной
        return this.generateUniversalPdf(content);
    }

    // Простой метод как запасной вариант
    static async generateSimplePdf(content: PdfContent): Promise<void> {
        return this.generateUniversalPdf(content);
    }

    private static fixFileName(text: string): string {
        return text
            .replace(/[^a-zа-яё0-9]/gi, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .substring(0, 50);
    }
}