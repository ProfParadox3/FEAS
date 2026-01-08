FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# [REAL CODE FIX] Install system dependencies required for python-magic and ffmpeg
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    libmagic1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy and install deps
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy app
COPY backend /app/backend

EXPOSE 8000

CMD ["python", "-m", "backend.app.main"]
