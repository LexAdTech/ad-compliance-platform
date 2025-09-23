from fastapi import FastAPI

app = FastAPI()

@app.post("/analyze")
def analyze_text(text: str):
    ...

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
