# 1. Base Image
FROM python:3.11-slim

# 2. Set working directory inside container
WORKDIR /app

# 3. Environment settings
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# 4. Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 5. Copy all project files into /app
COPY . .

# 6. Expose default Uvicorn port
EXPOSE 8000

# 7. Start Uvicorn pointing to main1:app
CMD ["uvicorn", "main1:app", "--host", "0.0.0.0", "--port", "8000"]