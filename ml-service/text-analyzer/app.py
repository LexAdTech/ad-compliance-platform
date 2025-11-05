from fastapi import FastAPI
from pydantic import BaseModel
from transformers import AutoModelForCausalLM, AutoTokenizer, TextStreamer
import torch
import os

app = FastAPI()

print(f"CUDA available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"CUDA device count: {torch.cuda.device_count()}")
    for i in range(torch.cuda.device_count()):
        print(f"GPU {i}: {torch.cuda.get_device_name(i)}")

model_path = "/app/models/qwen-model-1.7B"

print("Checking model files...")
if not os.path.exists(model_path):
    raise Exception(f"Model not found at {model_path}")

print("Model files:", os.listdir(model_path))

print("Loading tokenizer...")
try:
    tokenizer = AutoTokenizer.from_pretrained(
        model_path, 
        trust_remote_code=True
    )
    streamer = TextStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
    print("Tokenizer loaded successfully")
except Exception as e:
    print(f"Error loading tokenizer: {e}")
    tokenizer = AutoTokenizer.from_pretrained(model_path)

print("Loading model...")
try:
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.float16,
        device_map="auto",
        trust_remote_code=True,
        low_cpu_mem_usage=True
    )
    print(f"Model loaded successfully on device: {model.device}")
except Exception as e:
    print(f"Error loading model on GPU: {e}")
    model = AutoModelForCausalLM.from_pretrained(
        model_path,
        torch_dtype=torch.float32,
        device_map="cpu",
        trust_remote_code=True
    )
    print("Model loaded on CPU")

class TextRequest(BaseModel):
    text: str
    report_type: str = "short"  # По умолчанию краткий отчет

@app.post("/analyze")
async def analyze_text(request: TextRequest):
    try:
        if request.report_type == "full":
            # Промпт для полного отчета
            prompt = f'''Ты — юридический эксперт по рекламному законодательству Российской Федерации.  
Твоя задача — проанализировать рекламный текст исключительно в рамках Федерального закона № 38-ФЗ «О рекламе» и практики ФАС России.  

**ВАЖНО**:  
— Ответ должен строго соответствовать указанной ниже структуре.
— НЕ добавляй в свой ответ мой промпт.  
— НЕ добавляй вводных фраз, комментариев, пояснений вне структуры.  
— НЕ используй маркетинговый или разговорный язык.  
— Все формулировки — юридически точные, с указанием статей и пунктов закона.  
— Если нарушение отсутствует в каком-либо разделе — напиши: «Нарушений не выявлено».
— Уложись в 600 токенов. Больше ничего не пиши.

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

Больше ничего не пиши.
'''
        else:
            # Промпт для краткого отчета
            prompt = f'''Текст: "{request.text}"
            
Формат ответа (Только один вариант, уложись в 100 токенов. Больше ничего не пиши.):
"Несоответствие! [одна фраза о нарушении]"
или
"Реклама соответствует законодательству."

Ответ:'''

        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        outputs = model.generate(
            **inputs,
            max_new_tokens=1000 if request.report_type == "full" else 100,
            do_sample=True,
            temperature=1.2,
            top_p=0.9,
            streamer=streamer,
            pad_token_id=tokenizer.eos_token_id,
            eos_token_id=tokenizer.eos_token_id,
        )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        analysis_result = response.replace(prompt, "").strip()
        
        # УЛУЧШЕННАЯ ОБРЕЗКА РЕЗУЛЬТАТА
        if request.report_type == "full":
            # Находим первое вхождение структуры отчета
            start_marker = "1. Выявленные нарушения"
            start_index = analysis_result.find(start_marker)
            
            if start_index != -1:
                # Обрезаем все, что до первого маркера
                analysis_result = analysis_result[start_index:]
                
                # Ищем ВСЕ возможные точки обрезки
                cut_points = []
                
                # 1. Второе вхождение начального маркера
                second_occurrence = analysis_result.find(start_marker, len(start_marker))
                if second_occurrence != -1:
                    cut_points.append(second_occurrence)
                
                # 2. Тройные кавычки ```
                triple_quotes_index = analysis_result.find('```')
                if triple_quotes_index != -1:
                    cut_points.append(triple_quotes_index)
                
                # 3. Начало нового блока кода (если есть)
                code_block_start = analysis_result.find('\n```')
                if code_block_start != -1:
                    cut_points.append(code_block_start)
                
                # Если нашли точки обрезки, берем самую раннюю
                if cut_points:
                    earliest_cut = min(cut_points)
                    analysis_result = analysis_result[:earliest_cut].strip()
            
            # Дополнительная очистка: удаляем кавычки в начале, если есть
            analysis_result = analysis_result.lstrip('"').strip()
            
            # Удаляем тройные кавычки в начале и конце, если остались
            analysis_result = analysis_result.strip('`').strip()
            
        else:
            # Для краткого отчета - берем только первую фразу
            lines = analysis_result.split('\n')
            if lines:
                analysis_result = lines[0].strip()
                # Удаляем кавычки если есть, включая тройные
                analysis_result = analysis_result.strip('"').strip('`')
        
        return {"analysis": analysis_result}
    
    except Exception as e:
        return {"error": str(e)}

@app.get("/service_check")
async def service_check():
    return {"status": "ready"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)