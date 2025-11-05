FROM python:3.9-slim

WORKDIR /app

# Минимальные системные зависимости
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Установка Ollama
RUN curl -fsSL https://ollama.ai/install.sh | sh

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

# Создаем скрипт для запуска
RUN echo '#!/bin/bash\n\
ollama serve &\n\
sleep 15\n\
ollama pull llava\n\
python app.py\n' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]