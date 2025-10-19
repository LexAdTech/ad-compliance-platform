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

model_path = "/app/models/qwen-model"

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
        trust_remote_code=True
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

@app.post("/analyze")
async def analyze_text(request: TextRequest):
    try:
        prompt = f'''Ты — AI-ассистент для анализа рекламных текстов на соответствие законодательству.
Твоя задача — тщательно проанализировать рекламный текст и выявить все нарушения.

Проанализируй рекламный текст на соответствие законодательству: {request.text}
Ответ:
'''

        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
        
        outputs = model.generate(
            **inputs,
            max_new_tokens=50,
            do_sample=True,
            temperature=0.7,
            top_p=0.9,
            pad_token_id=tokenizer.eos_token_id,
            streamer=streamer
        )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        analysis_result = response.replace(prompt, "").strip()
        
        return {"analysis": analysis_result}
    
    except Exception as e:
        return {"error": str(e)}

@app.get("/service_check")
async def service_check():
    return {"status": "ready"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)