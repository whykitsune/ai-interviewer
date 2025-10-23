from fastapi import APIRouter

router = APIRouter()

@router.get("/topics")
def get_topics():
    # TODO: вернуть список тем
    return {"topics": ["Backend", "Frontend", "ML", "DevOps"]}

@router.get("/levels")
def get_levels():
    # TODO: вернуть уровни сложности
    return {"levels": ["Junior", "Middle", "Senior"]}

@router.post("/start")
def start_interview():
    # TODO: инициализация сессии собеседования
    return {"message": "Interview started (stub)"}

@router.post("/chat")
def ai_chat():
    # TODO: логика общения с ИИ
    return {"message": "AI chat stub"}

@router.post("/finish")
def finish_interview():
    # TODO: завершить собеседование
    return {"message": "Interview finished (stub)"}
