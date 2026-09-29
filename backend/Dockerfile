# use a clean, lightweight python 3.11/3.12 slim image
FROM python:3.11-slim 

# Prevent Python from writing .pyc files & enable unbuffered logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies required for ChromaDB (C++ compiler) & PyMuPDF
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory inside container
WORKDIR /app

# copy requirements.txt & install dependencies
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy backend application code
COPY . .

# Create directories for runtime data
RUN mkdir -p uploads chroma_db

# Render provides the port in the $PORT environment variable (defaults to 8000)
ENV PORT=8000
EXPOSE ${PORT}

# Run FastAPI using uvicorn
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]

