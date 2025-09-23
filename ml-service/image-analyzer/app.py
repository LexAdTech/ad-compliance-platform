from fastapi import FastAPI, UploadFile, File
import cv2
import numpy as np

app = FastAPI()

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    ...

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
