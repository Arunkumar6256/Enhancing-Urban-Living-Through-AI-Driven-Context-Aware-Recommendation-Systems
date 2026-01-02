FROM python:3.10-slim
WORKDIR /app
COPY . /app
RUN pip install --no-cache-dir -r requirements.txt
# Ensure artifacts are mounted to /app/recommender_artifacts at runtime
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
