# Используем официальный образ Python
FROM python:3.11-slim

# Рабочая директория внутри контейнера
WORKDIR /code

# Запрещаем создание .pyc файлов и буферизацию
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Копируем requirements.txt (предполагается, что он в корне проекта)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]