from fastapi import APIRouter

router = APIRouter()

@router.get("/last")
def get_last_feedback():
    # TODO: вернуть последний фидбэк пользователя
    return {
        "feedback": "Отличное знание Python и FastAPI, но стоит улучшить алгоритмическое мышление.",
        "score": 8.5
    }
