from fastapi import FastAPI
from app.api.router import api_router

app = FastAPI(title="AI Interview Platform")

# Подключение всех маршрутов
app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AI Interview Platform API"}
