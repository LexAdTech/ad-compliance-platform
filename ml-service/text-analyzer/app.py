from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
import os
import time
import uuid
from typing import Optional

app = FastAPI()

# Конфигурация GigaChat API
GIGACHAT_AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
GIGACHAT_API_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"

AUTH_BASE64 = "MDE5YTVmM2UtZWU0Ny03NGQ0LWE1MWQtMWNhNTc4MzY5ODNlOjVkMWVjZjJhLWViMTYtNGJlNC1iOWVlLTg3MzA2MzFhM2UxNw=="
SCOPE = "GIGACHAT_API_PERS"

_access_token = None
_token_expires_at = 0

class TextRequest(BaseModel):
    text: str
    report_type: str = "short"

def get_access_token() -> str:
    """Получение access token для GigaChat API"""
    global _access_token, _token_expires_at
    
    # Проверка, не истек ли текущий токен
    if _access_token and time.time() < _token_expires_at:
        return _access_token
    
    try:
        print("Attempting to get access token from GigaChat API...")
        
        response = requests.post(
            GIGACHAT_AUTH_URL,
            headers={
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'RqUID': str(uuid.uuid4()),
                'Authorization': f'Basic {AUTH_BASE64}'
            },
            data={'scope': SCOPE},
            verify=False,
            timeout=30
        )
        
        print(f"Auth response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            _access_token = data['access_token']
            _token_expires_at = time.time() + 3600 - 60
            print("Successfully obtained access token")
            return _access_token
        else:
            error_msg = f"Auth failed: {response.status_code} - {response.text}"
            print(error_msg)
            raise Exception(error_msg)
            
    except requests.exceptions.RequestException as e:
        error_msg = f"Network error: {str(e)}"
        print(error_msg)
        raise Exception(error_msg)
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        print(error_msg)
        raise Exception(error_msg)

def analyze_with_gigachat(prompt: str, max_tokens: int = 1000) -> str:
    """Отправка запроса к GigaChat API"""
    try:
        access_token = get_access_token()
        print("Sending analysis request to GigaChat...")
        
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
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                "max_tokens": max_tokens,
                "top_p": 0.9
            },
            verify=False,
            timeout=30
        )
        
        print(f"Analysis response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            return data['choices'][0]['message']['content']
        else:
            raise Exception(f"GigaChat API error: {response.status_code} - {response.text}")
            
    except Exception as e:
        raise Exception(f"Error calling GigaChat: {str(e)}")

@app.post("/analyze")
async def analyze_text(request: TextRequest):
    try:
        if request.report_type == "full":
            prompt = f'''Ты — юридический эксперт по рекламному законодательству Российской Федерации.  
Твоя задача — проанализировать рекламный текст исключительно в рамках Федерального закона № 38-ФЗ «О рекламе» и практики ФАС России.  

**ВАЖНО**:  
— Ответ должен строго соответствовать указанной ниже структуре.
— НЕ добавляй в свой ответ мой промпт.  
— НЕ добавляй вводных фраз, комментариев, пояснений вне структуры.  
— НЕ используй маркетинговый или разговорный язык.  
— Все формулировки — юридически точные, с указанием статей и пунктов закона.  
— Если нарушение отсутствует в каком-либо разделе — напиши: «Нарушений не выявлено».

Рекламный текст для анализа: {request.text}

Предоставь ответ **ТОЛЬКО** в следующем формате:

"1. Выявленные нарушения  
- [Цитата из текста]: нарушение п. [номер] ст. [номер] Закона № 38-ФЗ. Обоснование: [краткое юридическое обоснование].  
(Повторяй для каждого нарушения. Если нарушений нет — укажи: «Нарушений не выявлено».)

2. Обязательные предупреждения  
- [Точный текст предупреждения, требуемого законом].  
(Если предупреждения не требуются — укажи: «Предупреждения не требуются».)

3. Юридические риски  
- Административная ответственность по ст. [номер] КоАП РФ: [размер штрафа для ИП/юрлица].  
- Риски: [перечисление: предписание ФАС, иск потребителя, иное].
(Если рисков нет — укажи: «Юридических рисков не выявлено».)

4. Рекомендации  
- Исключить формулировку: «[цитата]».  
- Заменить на: «[нейтральная, соответствующая закону формулировка]».  
(Если корректировка не требуется — укажи: «Корректировка не требуется».)"

Больше ничего не пиши.'''
            max_tokens = 1000
        else:
            prompt = f'''Ты — юридический эксперт по рекламному законодательству. 
Проанализируй рекламный текст на соответствие ФЗ-38 "О рекламе". 

Текст: "{request.text}"
            
Формат ответа (Только один вариант, уложись в 100 токенов. Больше ничего не пиши.):
"Несоответствие! [одна фраза о нарушении]"
или
"Реклама соответствует законодательству."

Ответ:'''
            max_tokens = 100

        analysis_result = analyze_with_gigachat(prompt, max_tokens)
        analysis_result = analysis_result.strip()
        
        return {"analysis": analysis_result}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")

@app.get("/service_check")
async def service_check():
    try:
        token = get_access_token()
        return {
            "status": "ready", 
            "gigachat_auth": "success",
            "message": "Service and GigaChat API are working"
        }
    except Exception as e:
        return {
            "status": "error", 
            "gigachat_auth": "failed",
            "message": str(e)
        }

@app.get("/models")
async def get_available_models():
    """Получение списка доступных моделей GigaChat"""
    try:
        access_token = get_access_token()
        
        response = requests.get(
            "https://gigachat.devices.sberbank.ru/api/v1/models",
            headers={
                'Accept': 'application/json',
                'Authorization': f'Bearer {access_token}'
            },
            verify=False,
            timeout=30
        )
        
        if response.status_code == 200:
            return response.json()
        else:
            raise HTTPException(status_code=response.status_code, detail=response.text)
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Text Analyzer Service is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)