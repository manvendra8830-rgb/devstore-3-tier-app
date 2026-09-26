# =========================================================
# Django Backend - Production Docker Image
# =========================================================

FROM python:3.12-slim

# Prevent Python from creating .pyc files
# and enable real-time logs
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# Application directory
WORKDIR /app

# Install system dependencies required by mysqlclient
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        default-libmysqlclient-dev \
        build-essential \
        pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy Django application
COPY . .

# Django API port
EXPOSE 8000

# Start Django API
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
