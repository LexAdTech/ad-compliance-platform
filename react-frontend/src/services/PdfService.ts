// services/PdfService.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Добавляем типы для autoTable
declare module 'jspdf' {
    interface jsPDF {
        autoTable: (options: any) => jsPDF;
        lastAutoTable: {
            finalY: number;
        };
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
        const pdf = new jsPDF();
        const margin = 20;
        let currentY = margin;

        // Заголовок на английском для надежности
        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(21, 114, 255);
        pdf.text('Advertising Text Analysis', margin, currentY);
        currentY += 25;

        // Мета-информация
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(44, 62, 80);

        pdf.text(`Title: ${this.ensureAscii(content.title)}`, margin, currentY);
        currentY += 8;
        pdf.text(`Report Type: ${content.reportType}`, margin, currentY);
        currentY += 8;
        pdf.text(`Date: ${content.timestamp}`, margin, currentY);
        currentY += 20;

        // Оригинальный текст
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(255, 127, 50);
        pdf.text('Original Text:', margin, currentY);
        currentY += 10;

        // Используем autoTable для текста с автоматическим разбиением на страницы
        autoTable(pdf, {
            startY: currentY,
            head: [],
            body: [[content.originalText]],
            styles: {
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 8,
                lineColor: [241, 241, 241],
                lineWidth: 0.5,
            },
            theme: 'grid',
            margin: { left: margin, right: margin },
            didDrawPage: (data) => {
                // Добавляем заголовок на каждой странице
                if (data.pageNumber > 1) {
                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'italic');
                    pdf.setTextColor(150, 150, 150);
                    pdf.text('Original Text (continued)', margin, 15);
                }
            }
        });

        // Получаем позицию после таблицы с оригинальным текстом
        currentY = (pdf as any).lastAutoTable.finalY + 15;

        // Результаты анализа
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(21, 114, 255);
        pdf.text('Analysis Results:', margin, currentY);
        currentY += 10;

        autoTable(pdf, {
            startY: currentY,
            head: [],
            body: [[content.analysis]],
            styles: {
                font: 'helvetica',
                fontSize: 10,
                cellPadding: 8,
                lineColor: [200, 200, 255],
                lineWidth: 0.5,
                fillColor: [240, 248, 255]
            },
            theme: 'grid',
            margin: { left: margin, right: margin },
            didDrawPage: (data) => {
                if (data.pageNumber > 1) {
                    pdf.setFontSize(10);
                    pdf.setFont('helvetica', 'italic');
                    pdf.setTextColor(150, 150, 150);
                    pdf.text('Analysis Results (continued)', margin, 15);
                }
            }
        });

        // Сохраняем PDF
        const fileName = `analysis_${this.fixFileName(content.title)}_${Date.now()}.pdf`;
        pdf.save(fileName);
    }

    // Альтернативный метод с canvas для гарантированного отображения кириллицы
    static async generateAnalysisPdfWithCanvas(content: PdfContent): Promise<void> {
        try {
            const html2canvas = (await import('html2canvas')).default;

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
            Сгенерировано ФоксПлюс - сервис анализа рекламных текстов. Сервис предоставляет предварительную оценку и носит рекомендательный характер. Для получения официального юридического заключения обратитесь к специалисту.
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
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Добавляем изображение с автоматическим разбиением на страницы
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(`analysis_${this.fixFileName(content.title)}_${Date.now()}.pdf`);
            document.body.removeChild(element);
        } catch (error) {
            console.error('Canvas PDF generation failed, falling back to text PDF:', error);
            return this.generateAnalysisPdf(content);
        }
    }

    // Функция для преобразования текста в ASCII (только для мета-данных)
    private static ensureAscii(text: string): string {
        return text
            .replace(/[^\x00-\x7F]/g, '') // Убираем не-ASCII символы
            .substring(0, 100);
    }

    // Функция для создания безопасного имени файла
    private static fixFileName(text: string): string {
        return text
            .replace(/[^a-zа-яё0-9]/gi, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '')
            .substring(0, 50);
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