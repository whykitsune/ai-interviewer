from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.user import UserCreate, UserLogin
from app.schemas.token import Token, RefreshTokenRequest
from app.repositories.user import UserRepository
from app.repositories.token import TokenRepository
from app.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])

def get_auth_service(db: AsyncSession = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(db), TokenRepository(db))

@router.post("/register")
async def register(
    user: UserCreate,
    service: AuthService = Depends(get_auth_service)
):
    await service.register_user(user)
    return {"msg": "User created successfully"}

@router.post("/login", response_model=Token)
async def login(
    user_data: UserLogin,
    service: AuthService = Depends(get_auth_service)
):
    return await service.authenticate_user(user_data)

@router.post("/refresh", response_model=Token)
async def refresh_token(
    request: RefreshTokenRequest,
    service: AuthService = Depends(get_auth_service)
):
    return await service.refresh_access_token(request.refresh_token)

@router.post("/logout")
async def logout(
    request: RefreshTokenRequest,
    service: AuthService = Depends(get_auth_service)
):
    await service.logout(request.refresh_token)
    return {"msg": "Logged out"}