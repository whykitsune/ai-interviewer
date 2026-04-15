from datetime import datetime, timedelta
import secrets
from fastapi import HTTPException, status
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.user import User
from app.models.token import RefreshToken
from app.repositories.user import UserRepository
from app.repositories.token import TokenRepository
from app.schemas.user import UserCreate, UserLogin


class AuthService:
    def __init__(self, user_repo: UserRepository, token_repo: TokenRepository):
        self.user_repo = user_repo
        self.token_repo = token_repo

    async def register_user(self, user_data: UserCreate):
        existing = await self.user_repo.get_by_email(user_data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")

        hashed_pw = get_password_hash(user_data.password)
        new_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=hashed_pw
        )
        return await self.user_repo.create(new_user)

    async def authenticate_user(self, user_data: UserLogin):
        user = await self.user_repo.get_by_email(user_data.email)
        if not user or not verify_password(user_data.password, user.hashed_password):
            raise HTTPException(status_code=401, detail="Incorrect email or password")

        return await self._create_tokens(user)

    async def refresh_access_token(self, refresh_token: str):
        stored_token = await self.token_repo.get_by_token(refresh_token)
        if not stored_token:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        if stored_token.expires_at < datetime.utcnow():
            await self.token_repo.delete(stored_token)
            raise HTTPException(status_code=401, detail="Refresh token expired")

        await self.token_repo.delete(stored_token)

        user = await self.user_repo.get_by_id(stored_token.user_id)
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        return await self._create_tokens(user)

    async def logout(self, refresh_token: str):
        token = await self.token_repo.get_by_token(refresh_token)
        if token:
            await self.token_repo.delete(token)

    async def _create_tokens(self, user: User):
        access_token = create_access_token(data={"sub": str(user.id), "role": user.role})

        refresh_token_str = secrets.token_urlsafe(32)
        refresh_token_obj = RefreshToken(
            token=refresh_token_str,
            user_id=user.id,
            expires_at=datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        )

        await self.token_repo.create(refresh_token_obj)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token_str,
            "token_type": "bearer"
        }