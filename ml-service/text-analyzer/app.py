from fastapi import FastAPI, Request

app = FastAPI()

BLACKLIST = [
    "самый дешевый",
    "самый дешёвый",
    "гарантия 100%", 
    "без риска",
    "лучший в мире",
    "уникальный",
    "только у нас",
    "бесплатно",
    "кредит под 0%",
    "заработок без вложений",
    "выиграй миллион"
]

@app.post("/analyze")
async def analyze_text(request: Request):
    body = await request.body()
    text = body.decode('utf-8')
    
    if text.startswith('text='):
        text = text[5:]
    
    text_lower = text.lower()
    violations = []
    
    for word in BLACKLIST:
        if word in text_lower:
            violations.append(word)
    
    return {
        "has_violations": len(violations) > 0,
        "violations": violations,
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)