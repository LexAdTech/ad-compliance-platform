from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import speech_recognition as sr
from pydub import AudioSegment
import io
import tempfile
import os
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

def audio_to_text(audio_file: UploadFile) -> str:
    """Конвертирует аудиофайл в текст"""
    temp_audio_path = None
    wav_path = None
    
    try:
        logger.info(f"Начало обработки аудиофайла: {audio_file.filename}")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_audio:
            content = audio_file.file.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name
        
        logger.info(f"Временный файл создан: {temp_audio_path}")
        
        try:
            audio = AudioSegment.from_file(temp_audio_path)
            wav_path = temp_audio_path.replace('.wav', '_converted.wav')
            audio.export(wav_path, format="wav")
            logger.info(f"Аудио конвертировано в WAV: {wav_path}")
        except Exception as e:
            raise Exception(f"Ошибка конвертации аудио в WAV: {str(e)}")
        
        recognizer = sr.Recognizer()
        try:
            with sr.AudioFile(wav_path) as source:
                recognizer.adjust_for_ambient_noise(source, duration=0.5)
                audio_data = recognizer.record(source)
                logger.info("Аудио записано, начинаем распознавание...")
                
                text = recognizer.recognize_google(audio_data, language="ru-RU")
                logger.info(f"Текст распознан: {text[:100]}...")
                
        except sr.UnknownValueError:
            raise Exception("Не удалось распознать речь в аудиофайле")
        except sr.RequestError as e:
            raise Exception(f"Ошибка сервиса распознавания: {str(e)}")
        
        return text
    
    except Exception as e:
        logger.error(f"Ошибка обработки аудио: {str(e)}")
        raise e
        
    finally:
        try:
            if temp_audio_path and os.path.exists(temp_audio_path):
                os.unlink(temp_audio_path)
                logger.info(f"Временный файл удален: {temp_audio_path}")
            if wav_path and os.path.exists(wav_path):
                os.unlink(wav_path)
                logger.info(f"Конвертированный файл удален: {wav_path}")
        except Exception as e:
            logger.warning(f"Ошибка при удалении временных файлов: {str(e)}")

@app.post("/speech-to-text")
async def convert_speech_to_text(audio_file: UploadFile = File(...)):
    """Конвертирует аудиофайл в текст"""
    logger.info(f"Получен запрос на конвертацию аудио: {audio_file.filename}")
    
    if not audio_file.content_type or not audio_file.content_type.startswith('audio/'):
        logger.error(f"Неверный тип файла: {audio_file.content_type}")
        raise HTTPException(status_code=400, detail="Файл должен быть аудио")
    
    try:
        text = audio_to_text(audio_file)
        logger.info("Аудио успешно конвертировано в текст")
        return {"text": text, "status": "success"}
    except Exception as e:
        logger.error(f"Ошибка при конвертации аудио: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка обработки аудио: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "speech-to-text"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)