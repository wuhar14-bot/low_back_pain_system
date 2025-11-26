# OCR Service Dockerfile (CPU-only for Render deployment)
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV and PaddleOCR
RUN apt-get update --fix-missing && \
    apt-get install -y --no-install-recommends \
    libgomp1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1 \
    && apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements_ocr.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements_ocr.txt

# Copy service file
COPY ocr_service.py .

# Expose port
EXPOSE 5001

# Set environment variable to disable GPU
ENV USE_GPU=false

# Run the service
CMD ["python", "ocr_service.py"]
