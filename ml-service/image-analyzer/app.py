from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import logging

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

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    try:
        logger.info(f"Processing image: {file.filename}")
        
        # Заглушка для тестирования
        analysis_result = """
АНАЛИЗ ГРАФИЧЕСКОЙ РЕКЛАМЫ
        """.strip()
        
        return {"analysis": analysis_result}
        
    except Exception as e:
        logger.error(f"Error: {e}")
        return {"error": f"Ошибка анализа: {str(e)}"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "image-analyzer"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000)