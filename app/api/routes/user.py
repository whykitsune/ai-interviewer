from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.schemas.user import UserResponse, UserRoleUpdate
from app.models.interview import Interview
from app.schemas.interview import InterviewResponse

from app.services.s3_service import S3Service
from app.services.github_service import GithubService

router = APIRouter(prefix="/users", tags=["Users"])


async def get_current_user(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)) -> User:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


async def get_current_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостаточно прав. Требуется роль администратора."
        )
    return user


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/me/resume")
async def upload_resume(
        file: UploadFile = File(...),
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    s3_service = S3Service()
    key = f"user_{current_user.id}/{file.filename}"

    await s3_service.upload_file(file, key)

    current_user.resume_path = key
    await db.commit()
    return {"filename": key}


@router.get("/me/resume-url")
async def get_resume_url(
        current_user: User = Depends(get_current_user)
):
    if not current_user.resume_path:
        return {"url": None}

    s3_service = S3Service()
    url = await s3_service.get_presigned_url(current_user.resume_path)
    return {"url": url}


@router.get("/me/last-feedback", response_model=InterviewResponse | None)
async def get_last_feedback(
        current_user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    query = (
        select(Interview)
        .options(selectinload(Interview.messages))
        .where(Interview.user_id == current_user.id, Interview.is_finished == True)
        .order_by(Interview.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().first()


@router.get("/me/github-repos")
async def get_github_repos(
        username: str,
        current_user: User = Depends(get_current_user)
):
    """Интеграция с GitHub API"""
    repos = await GithubService.get_user_repos(username)
    return {"repos": repos}


@router.get("/", response_model=List[UserResponse])
async def read_all_users(
        skip: int = 0,
        limit: int = 100,
        admin: User = Depends(get_current_admin),
        db: AsyncSession = Depends(get_db)
):
    query = select(User).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/{user_id}")
async def delete_user(
        user_id: int,
        admin: User = Depends(get_current_admin),
        db: AsyncSession = Depends(get_db)
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.resume_path:
        try:
            s3_service = S3Service()
            await s3_service.delete_file(user.resume_path)
        except Exception as e:
            print(f"Ошибка удаления файла из S3: {e}")

    await db.delete(user)
    await db.commit()
    return {"msg": f"User {user_id} deleted"}


@router.patch("/{user_id}/role")
async def update_user_role(
        user_id: int,
        role_data: UserRoleUpdate,
        admin: User = Depends(get_current_admin),
        db: AsyncSession = Depends(get_db)
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if role_data.role not in ["user", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role")

    user.role = role_data.role
    await db.commit()
    return {"msg": f"User {user_id} role updated to {role_data.role}"}
