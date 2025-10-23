from fastapi import APIRouter

router = APIRouter()

@router.get("/account")
def get_user_account():
    # TODO: получить из базы резюме и фидбэк
    return {
        "user": {"id": 1, "email": "user@example.com"},
        "resume": {"file_path": "/uploads/resume.pdf"},
        "last_feedback": {
            "text": "Отличное знание Python, стоит улучшить алгоритмы.",
            "score": 8.3
        }
    }
