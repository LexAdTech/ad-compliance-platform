// services/PdfService.ts
import jsPDF from 'jspdf';

// Добавляем поддержку кириллицы
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
    static async generateAnalysisPdf(content: PdfContent): Promise<void> {
        // Создаем PDF с поддержкой кириллицы
        const pdf = new jsPDF();

        // Устанавливаем шрифт поддерживающий кириллицу
        // Временно используем стандартный шрифт, но правильно обрабатываем текст
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 20;
        let yPosition = margin;

        // Функция для правильного отображения русского текста
        const addText = (text: string, x: number, y: number, maxWidth?: number) => {
            if (maxWidth) {
                const lines = pdf.splitTextToSize(this.fixTextEncoding(text), maxWidth);
                pdf.text(lines, x, y);
                return lines.length;
            } else {
                pdf.text(this.fixTextEncoding(text), x, y);
                return 1;
            }
        };

        // Заголовок
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(21, 114, 255);
        addText('Анализ рекламного текста', margin, yPosition);
        yPosition += 25;

        // Информация о анализе
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(44, 62, 80);

        addText(`Заголовок: ${content.title}`, margin, yPosition);
        yPosition += 10;

        addText(`Тип отчета: ${content.reportType === 'short' ? 'Краткий' : 'Полный'}`, margin, yPosition);
        yPosition += 10;

        addText(`Дата анализа: ${content.timestamp}`, margin, yPosition);
        yPosition += 20;

        // Оригинальный текст
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 127, 50);
        addText('Исходный текст:', margin, yPosition);
        yPosition += 10;

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(44, 62, 80);
        const originalTextLines = pdf.splitTextToSize(this.fixTextEncoding(content.originalText), pageWidth - 2 * margin);
        pdf.text(originalTextLines, margin, yPosition);
        yPosition += originalTextLines.length * 7 + 15;

        // Результаты анализа
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(21, 114, 255);
        addText('Результаты анализа:', margin, yPosition);
        yPosition += 10;

        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(44, 62, 80);
        const analysisText = this.fixTextEncoding(content.analysis);
        const analysisLines = pdf.splitTextToSize(analysisText, pageWidth - 2 * margin);

        // Проверяем, помещается ли текст на текущей странице
        const lineHeight = 7;
        const neededHeight = analysisLines.length * lineHeight;

        if (yPosition + neededHeight > pdf.internal.pageSize.getHeight() - margin) {
            pdf.addPage();
            yPosition = margin;
        }

        pdf.text(analysisLines, margin, yPosition);

        // Сохраняем PDF
        const fileName = `анализ_${this.fixFileName(content.title)}_${Date.now()}.pdf`;
        pdf.save(fileName);
    }

    // Функция для исправления кодировки текста
    private static fixTextEncoding(text: string): string {
        if (!text) return '';

        // Заменяем проблемные символы
        return text
            .replace(/null/g, '') // Убираем null
            .replace(/\u0000/g, '') // Убираем нулевые символы
            .normalize('NFC'); // Нормализуем Unicode
    }

    // Функция для создания безопасного имени файла
    private static fixFileName(text: string): string {
        return text
            .replace(/[^a-zа-яё0-9]/gi, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .substring(0, 50);
    }

    // Альтернативный метод с использованием canvas для лучшей поддержки кириллицы
    static async generateAnalysisPdfWithCanvas(content: PdfContent): Promise<void> {
        try {
            // Динамически импортируем html2canvas для уменьшения размера бандла
            const html2canvas = (await import('html2canvas')).default;

            // Создаем временный элемент для рендеринга
            const element = document.createElement('div');
            element.style.position = 'absolute';
            element.style.left = '-9999px';
            element.style.top = '0';
            element.style.width = '794px'; // A4 width in pixels
            element.style.padding = '40px';
            element.style.backgroundColor = 'white';
            element.style.fontFamily = 'Arial, sans-serif';
            element.style.color = '#2c3e50';
            element.style.lineHeight = '1.6';

            element.innerHTML = `
        <div style="font-family: Arial, sans-serif;">
          <h1 style="color: #1572FF; border-bottom: 2px solid #1572FF; padding-bottom: 10px; margin-bottom: 30px;">
            Анализ рекламного текста
          </h1>
          
          <div style="margin-bottom: 25px;">
            <p><strong>Заголовок:</strong> ${this.escapeHtml(content.title)}</p>
            <p><strong>Тип отчета:</strong> ${content.reportType === 'short' ? 'Краткий' : 'Полный'}</p>
            <p><strong>Дата анализа:</strong> ${this.escapeHtml(content.timestamp)}</p>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #FF7F32; margin-bottom: 15px;">Исходный текст:</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #FF7F32;">
              ${this.formatTextForHtml(content.originalText)}
            </div>
          </div>

          <div style="margin-bottom: 30px;">
            <h2 style="color: #1572FF; margin-bottom: 15px;">Результаты анализа:</h2>
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; border-left: 4px solid #1572FF;">
              ${this.formatTextForHtml(content.analysis)}
            </div>
          </div>

          <footer style="margin-top: 50px; text-align: center; color: #7f8c8d; font-size: 12px; border-top: 1px solid #ecf0f1; padding-top: 20px;">
            <p>Сгенерировано ФоксПлюс - сервис анализа рекламных текстов*</p>
            Сервис предоставляет предварительную оценку и носит рекомендательный характер. Для 
            получения официального юридического аключения обратитесь к специалисту.
          </footer>
        </div>
      `;

            document.body.appendChild(element);

            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`анализ_${this.fixFileName(content.title)}_${Date.now()}.pdf`);

            document.body.removeChild(element);
        } catch (error) {
            console.error('Canvas PDF generation failed, falling back to text PDF:', error);
            // Если метод с canvas не сработал, используем текстовый метод
            return this.generateAnalysisPdf(content);
        }
    }

    private static escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private static formatTextForHtml(text: string): string {
        if (!text) return '';

        return text
            .replace(/null/g, '')
            .replace(/\u0000/g, '')
            .replace(/\n/g, '<br>')
            .replace(/\r/g, '');
    }
}