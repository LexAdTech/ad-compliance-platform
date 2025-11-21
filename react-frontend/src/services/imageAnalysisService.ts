// services/imageAnalysisService.ts

export interface ImageAnalysisResult {
    filename: string;
    extracted_text: string;
    detected_faces: number;
    detected_objects: Array<{
        name: string;
        probability: number;
    }>;
    gigachat_analysis: string;
    timestamp: string;
}

export interface ImageAnalysisResponse {
    image_analysis: ImageAnalysisResult;
}

export interface ImageAnalysisServiceResult {
    analysis: string;
    error?: string;
    extractedText?: string;
    detectedFaces?: number;
    detectedObjects?: Array<{name: string; probability: number}>;
}

export const imageAnalysisService = {
    async analyzeAdImage(imageFile: File): Promise<ImageAnalysisServiceResult> {
        try {
            const IMAGE_ANALYZER_URL = 'http://localhost:8002';
            
            const formData = new FormData();
            formData.append('file', imageFile);

            console.log('Sending image to Yandex Vision analyzer...');
            
            const response = await fetch(`${IMAGE_ANALYZER_URL}/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }

            const result: ImageAnalysisResponse = await response.json();
            console.log('Yandex Vision analysis result:', result);
            
            // Возвращаем анализ от GigaChat
            return { 
                analysis: result.image_analysis.gigachat_analysis,
                extractedText: result.image_analysis.extracted_text,
                detectedFaces: result.image_analysis.detected_faces,
                detectedObjects: result.image_analysis.detected_objects
            };
        } catch (error) {
            console.error('Image analysis error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Ошибка при анализе изображения';
            return {
                analysis: `❌ ${errorMessage}`,
                error: errorMessage
            };
        }
    },
};