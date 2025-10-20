// components/AdAnalysis/AdAnalysis.tsx
import React, { useState } from 'react';
import { adAnalysisService, AnalysisResult } from '../../services/adAnalysisService';
import { usePdfExport } from '../../hooks/usePdfExport';
import styles from './AdAnalysis.module.css';

interface AdAnalysisProps {
    onAnalysisComplete?: (result: AnalysisResult) => void;
}

export const AdAnalysis: React.FC<AdAnalysisProps> = ({ onAnalysisComplete }) => {
    const [text, setText] = useState('');
    const [reportType, setReportType] = useState<'short' | 'full'>('short');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { exportAnalysisToPdf, isGenerating } = usePdfExport();

    const handleAnalyze = async () => {
        if (!text.trim()) {
            setError('Пожалуйста, введите текст для анализа');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const result = await adAnalysisService.analyzeAdText(text, reportType);
            setAnalysisResult(result);
            onAnalysisComplete?.(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Произошла ошибка при анализе');
            setAnalysisResult(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportPdf = async () => {
        if (!analysisResult) return;

        try {
            await exportAnalysisToPdf({
                title: `Анализ рекламного текста - ${new Date().toLocaleDateString('ru-RU')}`,
                originalText: text,
                analysis: analysisResult.analysis,
                reportType: reportType
            });
        } catch (err) {
            setError('Ошибка при создании PDF');
        }
    };

    const handleClear = () => {
        setText('');
        setAnalysisResult(null);
        setError(null);
    };

    return (
        <div className={styles.adAnalysis}>
            <div className={styles.analysisHeader}>
                <h2>Анализ рекламного текста</h2>
                <p>Получите профессиональный анализ вашего рекламного текста с помощью AI</p>
            </div>

            <div className={styles.analysisControls}>
                <div className={styles.inputGroup}>
                    <label htmlFor="ad-text">Рекламный текст:</label>
                    <textarea
                        id="ad-text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Введите ваш рекламный текст здесь..."
                        rows={6}
                        className={styles.textInput}
                    />
                </div>

                <div className={styles.reportTypeGroup}>
                    <label>Тип отчета:</label>
                    <div className={styles.radioButtons}>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                value="short"
                                checked={reportType === 'short'}
                                onChange={(e) => setReportType(e.target.value as 'short' | 'full')}
                            />
                            Краткий
                        </label>
                        <label className={styles.radioLabel}>
                            <input
                                type="radio"
                                value="full"
                                checked={reportType === 'full'}
                                onChange={(e) => setReportType(e.target.value as 'short' | 'full')}
                            />
                            Полный
                        </label>
                    </div>
                </div>

                <div className={styles.actionButtons}>
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !text.trim()}
                        className={styles.analyzeBtn}
                    >
                        {isLoading ? 'Анализ...' : 'Проанализировать'}
                    </button>

                    <button
                        onClick={handleClear}
                        disabled={isLoading}
                        className={styles.clearBtn}
                    >
                        Очистить
                    </button>
                </div>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    {error}
                </div>
            )}

            {analysisResult && (
                <div className={styles.analysisResult}>
                    <div className={styles.resultHeader}>
                        <h3>Результаты анализа</h3>
                        <button
                            onClick={handleExportPdf}
                            disabled={isGenerating}
                            className={styles.exportPdfBtn}
                        >
                            {isGenerating ? 'Создание PDF...' : '📥 Скачать PDF'}
                        </button>
                    </div>

                    <div className={styles.resultContent}>
                        {analysisResult.error ? (
                            <div className={styles.errorResult}>
                                <strong>Ошибка:</strong> {analysisResult.error}
                            </div>
                        ) : (
                            <div className={styles.successResult}>
                                <div className={styles.analysisText}>
                                    {analysisResult.analysis.split('\n').map((paragraph, index) => (
                                        <p key={index}>{paragraph}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};