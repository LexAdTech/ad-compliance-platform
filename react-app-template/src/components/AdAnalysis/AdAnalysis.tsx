// components/AdAnalysis/AdAnalysis.tsx
import React, { useState } from 'react';
import { adAnalysisService, AnalysisResult } from '../../services/adAnalysisService';
import { usePdfExport } from '../../hooks/usePdfExport';
import './AdAnalysis.css';

export const AdAnalysis: React.FC = () => {
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
                title: `Анализ текста от ${new Date().toLocaleDateString('ru-RU')}`,
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
        <div className="ad-analysis">
            <div className="analysis-header">
                <h2>Анализ рекламного текста</h2>
                <p>Получите профессиональный анализ вашего рекламного текста с помощью AI</p>
            </div>

            <div className="analysis-controls">
                <div className="input-group">
                    <label htmlFor="ad-text">Рекламный текст:</label>
                    <textarea
                        id="ad-text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Введите ваш рекламный текст здесь..."
                        rows={6}
                        className="text-input"
                    />
                </div>

                <div className="report-type-group">
                    <label>Тип отчета:</label>
                    <div className="radio-buttons">
                        <label className="radio-label">
                            <input
                                type="radio"
                                value="short"
                                checked={reportType === 'short'}
                                onChange={(e) => setReportType(e.target.value as 'short' | 'full')}
                            />
                            Краткий
                        </label>
                        <label className="radio-label">
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

                <div className="action-buttons">
                    <button
                        onClick={handleAnalyze}
                        disabled={isLoading || !text.trim()}
                        className="analyze-btn"
                    >
                        {isLoading ? 'Анализ...' : 'Проанализировать'}
                    </button>

                    <button
                        onClick={handleClear}
                        disabled={isLoading}
                        className="clear-btn"
                    >
                        Очистить
                    </button>
                </div>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            {analysisResult && (
                <div className="analysis-result">
                    <div className="result-header">
                        <h3>Результаты анализа</h3>
                        <button
                            onClick={handleExportPdf}
                            disabled={isGenerating}
                            className="export-pdf-btn"
                        >
                            {isGenerating ? 'Создание PDF...' : 'Скачать PDF'}
                        </button>
                    </div>

                    <div className="result-content">
                        {analysisResult.error ? (
                            <div className="error-result">
                                <strong>Ошибка:</strong> {analysisResult.error}
                            </div>
                        ) : (
                            <div className="success-result">
                                <div className="analysis-text">
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