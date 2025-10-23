from fastapi import APIRouter

router = APIRouter()

@router.post("/register")
def register_user():
    # TODO: регистрация пользователя
    return {"message": "User registered (stub)"}

@router.post("/login")
def login_user():
    # TODO: вход пользователя
    return {"message": "User logged in (stub)"}
