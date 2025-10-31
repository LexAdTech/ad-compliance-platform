export interface ImageAnalysisResult {
    analysis: string;
    error?: string;
}

export const imageAnalysisService = {
    async analyzeAdImage(imageFile: File): Promise<ImageAnalysisResult> {
        try {
            const IMAGE_ANALYZER_URL = 'http://localhost:8002';
            
            const formData = new FormData();
            formData.append('file', imageFile);

            console.log('Sending image directly to image-analyzer...');
            
            const response = await fetch(`${IMAGE_ANALYZER_URL}/analyze`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Image analysis error:', error);
            throw new Error(error instanceof Error ? error.message : 'Ошибка при анализе изображения');
        }
    },
};