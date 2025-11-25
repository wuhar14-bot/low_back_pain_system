# MediaPipe Pose Service Dockerfile (CPU-only for Render deployment)
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV and MediaPipe
RUN apt-get update && apt-get install -y \
    libgomp1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements_pose.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements_pose.txt

# Copy service file
COPY pose_service.py .

# Expose port
EXPOSE 5002

# Run the service
CMD ["python", "pose_service.py"]
