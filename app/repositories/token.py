from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.token import RefreshToken


class TokenRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, token: RefreshToken) -> RefreshToken:
        self.db.add(token)
        await self.db.commit()
        return token

    async def get_by_token(self, token_str: str) -> RefreshToken | None:
        result = await self.db.execute(select(RefreshToken).where(RefreshToken.token == token_str))
        return result.scalars().first()

    async def delete(self, token: RefreshToken):
        await self.db.delete(token)
        await self.db.commit()

    async def delete_by_user(self, user_id: int):
        result = await self.db.execute(select(RefreshToken).where(RefreshToken.user_id == user_id))
        tokens = result.scalars().all()
        for t in tokens:
            await self.db.delete(t)
        await self.db.commit()