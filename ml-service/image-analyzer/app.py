from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import logging
import ollama
from ollama import generate
from PIL import Image
from io import BytesIO
import asyncio

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

async def analyze_image_with_llava(image_bytes: bytes) -> str:
    """Анализирует рекламное изображение на соответствие законодательству"""
    try:
        full_response = ''
        
        prompt = """
Тщательно проанализируй рекламное изображение на соответствие законодательным требованиям. Обрати внимание на следующие аспекты:

1. **Текстовая информация:**
   - Распознай весь видимый текст на изображении
   - Проверь наличие обязательной информации (юридическое название, ОГРН, контакты)
   - Выяви скрытые условия, мелкий шрифт

2. **Визуальные элементы:**
   - Опиши основные изображения, цвета, композицию
   - Выяви потенциально вводящие в заблуждение элементы
   - Отметь чрезмерно агрессивные или манипулятивные визуальные приемы

3. **Специфические требования:**
   - Проверь наличие маркировок (реклама, 18+, и т.д.)
   - Выяви возможные нарушения в рекламе финансовых услуг
   - Отметь нарушения в рекламе лекарств, БАДов, медицинских услуг
   - Проверь корректность сравнений с конкурентами

4. **Общая оценка:**
   - Укажи потенциальные риски нарушения ФЗ "О рекламе"
   - Отметь возможные нарушения прав потребителей
   - Предложи рекомендации по исправлению

Представь ответ в структурированном виде с четкими выводами.
        """
        
        for response in generate(model='llava', 
                                 prompt=prompt,
                                 images=[image_bytes], 
                                 stream=True):
            full_response += response['response']
        
        return full_response.strip()
    
    except Exception as e:
        logger.error(f"LLaVA analysis error: {e}")
        return f"Ошибка анализа LLaVA: {str(e)}"

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        logger.info(f"Processing image: {file.filename}")
        
        # Проверяем что файл является изображением
        if not file.content_type.startswith('image/'):
            return {"error": "Файл должен быть изображением"}
        
        # Читаем файл
        contents = await file.read()
        
        # Конвертируем в bytes для LLaVA
        with Image.open(BytesIO(contents)) as img:
            with BytesIO() as buffer:
                img.save(buffer, format='PNG')
                image_bytes = buffer.getvalue()
        
        # Анализируем с LLaVA
        analysis_result = await analyze_image_with_llava(image_bytes)
        
        return {
            "filename": file.filename,
            "analysis": analysis_result,
            "model": "LLaVA"
        }
        
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"error": f"Ошибка анализа: {str(e)}"}

@app.get("/health")
async def health_check():
    # Проверяем доступность LLaVA
    try:
        models = ollama.list()
        llava_status = "available" if any(model['name'] == 'llava' for model in models['models']) else "not loaded"
        return {
            "status": "healthy", 
            "service": "image-analyzer",
            "llava_status": llava_status
        }
    except Exception as e:
        return {
            "status": "degraded", 
            "service": "image-analyzer",
            "llava_status": f"error: {str(e)}"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000)