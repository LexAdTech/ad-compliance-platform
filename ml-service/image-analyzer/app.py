import base64
import json
import logging
import os
import time
import uuid
from typing import Dict, Any

import requests
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Конфигурация API из переменных окружения
YANDEX_VISION_API_KEY = os.getenv("YANDEX_VISION_API_KEY", "")
YANDEX_FOLDER_ID = os.getenv("YANDEX_FOLDER_ID", "")

# Конфигурация GigaChat API из переменных окружения
GIGACHAT_AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
GIGACHAT_API_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"
AUTH_BASE64 = os.getenv("GIGACHAT_AUTH_BASE64", "")
SCOPE = "GIGACHAT_API_PERS"

_access_token = None
_token_expires_at = 0

# Отключаем предупреждения о небезопасных SSL-сертификатах для GigaChat
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)


def get_access_token() -> str:
    """Получение access token для GigaChat API без проверки SSL сертификатов"""
    global _access_token, _token_expires_at
    
    # Проверяем, не истек ли токен (оставляем запас в 5 минут)
    if _access_token and time.time() < _token_expires_at - 300:
        return _access_token
    
    try:
        logger.info("Получение access token от GigaChat API...")
        
        response = requests.post(
            GIGACHAT_AUTH_URL,
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'RqUID': str(uuid.uuid4()),
                'Authorization': f'Basic {AUTH_BASE64}'
            },
            data={'scope': SCOPE},
            timeout=30,
            verify=False  # Отключаем проверку SSL
        )
        
        logger.info(f"Статус аутентификации: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            _access_token = data['access_token']
            # Устанавливаем время истечения токена
            _token_expires_at = time.time() + data.get('expires_in', 1800)  # 30 минут по умолчанию
            logger.info(f"Access token успешно получен, истекает через {data.get('expires_in', 1800)} секунд")
            return _access_token
        else:
            error_msg = f"Ошибка аутентификации: {response.status_code} - {response.text}"
            logger.error(error_msg)
            raise Exception(error_msg)
            
    except Exception as e:
        logger.error(f"Ошибка при получении токена: {str(e)}")
        raise Exception(f"Ошибка аутентификации GigaChat: {str(e)}")


def analyze_with_gigachat(prompt: str) -> str:
    """Отправка запроса к GigaChat API и возврат чистого текста анализа"""
    try:
        access_token = get_access_token()
        logger.info("Отправка запроса на анализ в GigaChat...")
        
        response = requests.post(
            GIGACHAT_API_URL,
            headers={
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': f'Bearer {access_token}'
            },
            json={
                "model": "GigaChat",
                "messages": [
                    {
                        "role": "system",
                        "content": "Ты - юридический эксперт по рекламному законодательству РФ. Отвечай ТОЛЬКО текстом анализа без какого-либо форматирования, JSON или дополнительных полей."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.1,
                "max_tokens": 2000,
                "top_p": 0.5
            },
            timeout=60,
            verify=False  # Отключаем проверку SSL
        )
        
        logger.info(f"Статус анализа: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'choices' in data and len(data['choices']) > 0:
                result = data['choices'][0]['message']['content']
                logger.info(f"Получен чистый текст анализа:\n{result}")
                return result
            else:
                raise Exception("Неожиданная структура ответа от GigaChat")
        elif response.status_code == 401:
            # Если токен истек, сбрасываем его и пробуем еще раз
            logger.warning("Токен истек, получаем новый...")
            global _access_token, _token_expires_at
            _access_token = None
            _token_expires_at = 0
            return analyze_with_gigachat(prompt)  # Рекурсивный вызов с новым токеном
        else:
            try:
                error_data = response.json()
                error_msg = error_data.get('message', error_data.get('error', 'Неизвестная ошибка'))
                raise Exception(f"Ошибка GigaChat API: {response.status_code} - {error_msg}")
            except:
                raise Exception(f"Ошибка GigaChat API: {response.status_code} - {response.text}")
            
    except Exception as e:
        logger.error(f"Ошибка анализа: {str(e)}")
        raise


def extract_text_and_objects(vision_response: Dict) -> Dict[str, Any]:
    """Извлечение текста и объектов из ответа Yandex Vision"""
    logger.debug(f"Сырой ответ от Yandex Vision: {json.dumps(vision_response, indent=2)}")
    
    result = {
        "extracted_text": "Текст не обнаружен",
        "detected_faces": 0,
        "objects": []
    }
    
    try:
        if 'results' in vision_response and len(vision_response['results']) > 0:
            vision_result = vision_response['results'][0]
            if 'results' in vision_result and len(vision_result['results']) > 0:
                analysis_result = vision_result['results'][0]
                
                # Извлечение текста
                if 'textDetection' in analysis_result:
                    text_detection = analysis_result['textDetection']
                    pages = text_detection.get('pages', [])
                    text_blocks = []
                    
                    for page in pages:
                        for block in page.get('blocks', []):
                            for line in block.get('lines', []):
                                words = [word['text'] for word in line.get('words', [])]
                                if words:
                                    text_blocks.append(' '.join(words))
                    
                    if text_blocks:
                        result["extracted_text"] = '\n'.join(text_blocks)
                        logger.info(f"Извлеченный текст:\n{result['extracted_text']}")
                
                # Детекция лиц
                if 'faceDetection' in analysis_result:
                    faces = analysis_result['faceDetection'].get('faces', [])
                    result["detected_faces"] = len(faces)
                    logger.info(f"Обнаружено лиц: {result['detected_faces']}")
                
                # Классификация объектов
                if 'classification' in analysis_result:
                    classes = analysis_result['classification'].get('properties', [])
                    result["objects"] = [
                        {"name": cls['name'], "probability": cls['probability']} 
                        for cls in classes[:5]
                    ]
                    logger.info(f"Классифицированные объекты: {[obj['name'] for obj in result['objects']]}")
    
    except Exception as e:
        logger.error(f"Ошибка при извлечении данных из Yandex Vision: {str(e)}")
    
    return result


async def process_with_yandex_vision(image_data: bytes) -> Dict:
    """Отправка изображения в Yandex Vision API"""
    try:
        encoded_image = base64.b64encode(image_data).decode('utf-8')
        
        url = "https://vision.api.cloud.yandex.net/vision/v1/batchAnalyze"
        headers = {
            "Authorization": f"Api-Key {YANDEX_VISION_API_KEY}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "folderId": YANDEX_FOLDER_ID,
            "analyze_specs": [{
                "content": encoded_image,
                "features": [
                    {
                        "type": "TEXT_DETECTION",
                        "text_detection_config": {
                            "language_codes": ["ru", "en"],
                            "model": "page"
                        }
                    },
                    {
                        "type": "CLASSIFICATION",
                        "classification_config": {
                            "top_k": 5,
                            "confidence_threshold": 0.5
                        }
                    },
                    {
                        "type": "FACE_DETECTION",
                        "face_detection_config": {
                            "top_k": 10
                        }
                    }
                ]
            }]
        }
        
        logger.info("Отправка запроса в Yandex Vision API...")
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=60
        )
        
        logger.info(f"Статус ответа Yandex Vision: {response.status_code}")
        
        if response.status_code != 200:
            error_detail = response.text if response.text else "Пустой ответ"
            logger.error(f"Ошибка Yandex Vision API: {response.status_code} - {error_detail}")
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Ошибка Yandex Vision: {error_detail}"
            )
        
        # Проверяем, что ответ не пустой и является валидным JSON
        if not response.text.strip():
            logger.error("Пустой ответ от Yandex Vision API")
            raise HTTPException(status_code=500, detail="Пустой ответ от Yandex Vision API")
        
        try:
            vision_response = response.json()
            logger.info("Успешно получен и распарсен ответ от Yandex Vision API")
            return vision_response
            
        except json.JSONDecodeError as e:
            logger.error(f"Ошибка парсинга JSON от Yandex Vision: {str(e)}")
            logger.error(f"Сырой ответ (первые 500 символов): {response.text[:500]}")
            raise HTTPException(
                status_code=500, 
                detail=f"Невалидный JSON от Yandex Vision: {str(e)}"
            )
        
    except requests.exceptions.Timeout:
        logger.error("Таймаут при запросе к Yandex Vision API")
        raise HTTPException(status_code=504, detail="Таймаут при запросе к Yandex Vision API")
        
    except requests.exceptions.ConnectionError:
        logger.error("Ошибка соединения с Yandex Vision API")
        raise HTTPException(status_code=503, detail="Ошибка соединения с Yandex Vision API")
        
    except Exception as e:
        logger.error(f"Неожиданная ошибка при работе с Yandex Vision: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ошибка Yandex Vision: {str(e)}")


def create_gigachat_prompt(extracted_data: Dict[str, Any]) -> str:
    """Создание промпта для GigaChat с явным указанием формата ответа"""
    
    # Формируем информацию об обнаруженных объектах
    objects_info = []
    
    # Лица
    if extracted_data["detected_faces"] > 0:
        objects_info.append(f"Обнаружено лиц: {extracted_data['detected_faces']}")
    
    # Классифицированные объекты
    if extracted_data["objects"]:
        objects_list = [f"{obj['name']} (вероятность: {obj['probability']:.2f})" 
                        for obj in extracted_data["objects"][:3]]
        objects_info.append(f"Классифицированные объекты:\n" + "\n".join(objects_list))
    
    objects_section = "\n".join(objects_info) if objects_info else "Объекты не идентифицированы"
    
    # Формируем полный промпт
    prompt = f"""Проанализируй рекламное изображение на соответствие законодательству РФ.

ТЕКСТ, ОБНАРУЖЕННЫЙ НА ИЗОБРАЖЕНИИ:
{extracted_data['extracted_text']}

ОБНАРУЖЕННЫЕ ОБЪЕКТЫ НА ИЗОБРАЖЕНИИ:
{objects_section}

ТВОЯ ЗАДАЧА:
1. Провести комплексный юридический анализ рекламы
2. Выявить все возможные нарушения законодательства РФ о рекламе
3. Предоставить подробное заключение с указанием конкретных статей закона
4. Если нарушений нет, четко обосновать соответствие рекламы требованиям

СТРОГИЕ ПРАВИЛА:
- Отвечай ТОЛЬКО текстом анализа, НИКАКОГО JSON ИЛИ ДРУГИХ ФОРМАТОВ
- Не добавляй заголовков, метаданных или дополнительных полей
- Не используй маркированные списки, пиши цельным текстом
- Используй профессиональную юридическую терминологию
- Будь максимально конкретен в указании нарушений и статей закона
- Не пиши о распознанных на изображении тексте или объектах

НАЧНИ СВОЙ ОТВЕТ С ФРАЗЫ: \"Юридический анализ рекламного материала:\"
"""

    logger.info(f"Сформирован промпт для GigaChat (первые 500 символов): {prompt[:500]}...")
    return prompt


@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """Основной endpoint для анализа изображений"""
    logger.info(f"Начат анализ изображения: {file.filename}")
    
    # Проверка конфигурации
    if not YANDEX_VISION_API_KEY or not YANDEX_FOLDER_ID:
        logger.error("Не настроены учетные данные Yandex Vision API")
        raise HTTPException(
            status_code=500, 
            detail="Сервис анализа изображений не настроен. Проверьте конфигурацию Yandex Vision API."
        )
    
    try:
        # Чтение файла
        image_data = await file.read()
        logger.info(f"Размер файла: {len(image_data)} байт")
        
        # Проверяем размер файла
        if len(image_data) == 0:
            raise HTTPException(status_code=400, detail="Файл пустой")
        
        if len(image_data) > 10 * 1024 * 1024:  # 10MB limit
            raise HTTPException(status_code=400, detail="Файл слишком большой (максимум 10MB)")
        
        # Отправка в Yandex Vision
        vision_response = await process_with_yandex_vision(image_data)
        
        # Извлечение текста и объектов
        extracted_data = extract_text_and_objects(vision_response)
        
        # Создание промпта для GigaChat
        prompt = create_gigachat_prompt(extracted_data)
        
        # Анализ через GigaChat
        gigachat_analysis = analyze_with_gigachat(prompt)
        
        # Формирование финального ответа
        return {
            "image_analysis": {
                "filename": file.filename,
                "extracted_text": extracted_data["extracted_text"],
                "detected_faces": extracted_data["detected_faces"],
                "detected_objects": extracted_data["objects"],
                "gigachat_analysis": gigachat_analysis,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f"Критическая ошибка при анализе: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Критическая ошибка анализа: {str(e)}")


@app.get("/service_check")
async def service_check():
    """Проверка статуса сервиса"""
    try:
        # Проверяем настройки Yandex Vision
        if not YANDEX_VISION_API_KEY or not YANDEX_FOLDER_ID:
            return {
                "status": "error", 
                "message": "Отсутствуют учетные данные Yandex Vision"
            }
        
        # Проверяем GigaChat
        token = get_access_token()
        
        return {
            "status": "ready",
            "gigachat_auth": "success",
            "yandex_vision": "configured",
            "ssl_verification": "disabled_for_gigachat",
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "message": "Все сервисы работают в штатном режиме"
        }
    except Exception as e:
        logger.error(f"Ошибка проверки сервиса: {str(e)}")
        return {
            "status": "degraded",
            "gigachat_auth": "failed" if "GigaChat" in str(e) else "unknown",
            "yandex_vision": "configured" if YANDEX_VISION_API_KEY else "missing",
            "ssl_verification": "disabled_for_gigachat",
            "error": str(e),
            "message": "Частичная функциональность. Требуется вмешательство администратора."
        }


@app.get("/vision_check")
async def vision_check():
    """Проверка конфигурации Yandex Vision"""
    if not YANDEX_VISION_API_KEY:
        return {
            "status": "error",
            "message": "YANDEX_VISION_API_KEY не установлен"
        }
    
    if not YANDEX_FOLDER_ID:
        return {
            "status": "error", 
            "message": "YANDEX_FOLDER_ID не установлен"
        }
    
    return {
        "status": "configured",
        "yandex_vision": "ready",
        "api_key_length": len(YANDEX_VISION_API_KEY),
        "folder_id": YANDEX_FOLDER_ID[:10] + "..." if YANDEX_FOLDER_ID else "missing"
    }


@app.get("/")
async def root():
    return {
        "service": "Image Analyzer",
        "version": "1.0",
        "status": "operational",
        "endpoints": {
            "/analyze": "POST - анализ изображений",
            "/service_check": "GET - проверка состояния сервиса",
            "/vision_check": "GET - проверка конфигурации Yandex Vision"
        },
        "features": [
            "Распознавание текста на изображениях через Yandex Vision API",
            "Детекция лиц и объектов",
            "Юридический анализ через GigaChat",
            "Возврат чистого текста анализа без изменений"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    logger.info("Запуск сервиса анализа изображений...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")