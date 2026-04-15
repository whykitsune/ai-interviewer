# from typing import List
# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.ext.asyncio import AsyncSession
# from sqlalchemy.future import select
# from sqlalchemy.orm import selectinload
#
# from app.core.database import get_db
# from app.core.security import get_current_user_id
# from app.models.user import User
# from app.models.interview import Interview, ChatMessage
# from app.schemas.interview import InterviewCreate, InterviewResponse, MessageCreate
# from app.services.ai_service import AIService
#
# router = APIRouter(prefix="/interviews", tags=["Interviews"])
#
#
# async def get_current_user(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)) -> User:
#     user = await db.get(User, user_id)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user
#
#
# @router.post("/", response_model=InterviewResponse)
# async def start_interview(
#         interview_data: InterviewCreate,
#         user: User = Depends(get_current_user),
#         db: AsyncSession = Depends(get_db)
# ):
#     new_interview = Interview(
#         user_id=user.id,
#         topic=interview_data.topic,
#         level=interview_data.level
#     )
#     db.add(new_interview)
#     await db.commit()
#     await db.refresh(new_interview)
#
#     welcome_text = f"Привет! Я твой интервьюер по теме {interview_data.topic} ({interview_data.level}). Готов начать?"
#     welcome_msg = ChatMessage(
#         interview_id=new_interview.id,
#         role="ai",
#         content=welcome_text
#     )
#     db.add(welcome_msg)
#     await db.commit()
#
#     query = (
#         select(Interview)
#         .options(selectinload(Interview.messages))
#         .where(Interview.id == new_interview.id)
#     )
#     result = await db.execute(query)
#     return result.scalars().first()
#
#
# @router.get("/{interview_id}", response_model=InterviewResponse)
# async def get_interview(
#         interview_id: int,
#         user: User = Depends(get_current_user),
#         db: AsyncSession = Depends(get_db)
# ):
#     """
#     Позволяет пользователю видеть свое интервью,
#     А АДМИНУ — ЛЮБОЕ интервью.
#     """
#     query = select(Interview).options(selectinload(Interview.messages)).where(Interview.id == interview_id)
#
#     if user.role != "admin":
#         query = query.where(Interview.user_id == user.id)
#
#     result = await db.execute(query)
#     interview = result.scalars().first()
#
#     if not interview:
#         raise HTTPException(status_code=404, detail="Interview not found or access denied")
#     return interview
#
#
# @router.get("/user/{target_user_id}", response_model=List[InterviewResponse])
# async def get_user_interviews_admin(
#         target_user_id: int,
#         user: User = Depends(get_current_user),
#         db: AsyncSession = Depends(get_db)
# ):
#     """
#     Только для админа: посмотреть все интервью конкретного пользователя.
#     """
#     if user.role != "admin":
#         raise HTTPException(status_code=403, detail="Not enough permissions")
#
#     query = (
#         select(Interview)
#         .options(selectinload(Interview.messages))
#         .where(Interview.user_id == target_user_id)
#         .order_by(Interview.created_at.desc())
#     )
#     result = await db.execute(query)
#     return result.scalars().all()
#
#
# @router.post("/{interview_id}/chat")
# async def chat_interview(
#         interview_id: int,
#         message: MessageCreate,
#         user: User = Depends(get_current_user),
#         db: AsyncSession = Depends(get_db)
# ):
#     interview = await db.get(Interview, interview_id)
#
#     if not interview or interview.user_id != user.id:
#         raise HTTPException(status_code=404, detail="Interview not found")
#
#     if interview.is_finished:
#         raise HTTPException(status_code=400, detail="Interview is finished")
#
#     user_msg = ChatMessage(interview_id=interview_id, role="user", content=message.content)
#     db.add(user_msg)
#     await db.commit()
#
#     history_query = select(ChatMessage).where(ChatMessage.interview_id == interview_id).order_by(ChatMessage.timestamp)
#     history_res = await db.execute(history_query)
#     history = [{"role": m.role, "content": m.content} for m in history_res.scalars().all()]
#
#     ai_response_text = await AIService.get_chat_response(history)
#
#     ai_msg = ChatMessage(interview_id=interview_id, role="ai", content=ai_response_text)
#     db.add(ai_msg)
#     await db.commit()
#
#     return {"user_message": message.content, "ai_message": ai_response_text}
#
#
# @router.post("/{interview_id}/finish")
# async def finish_interview(
#         interview_id: int,
#         user: User = Depends(get_current_user),
#         db: AsyncSession = Depends(get_db)
# ):
#     interview = await db.get(Interview, interview_id)
#     if not interview or interview.user_id != user.id:
#         raise HTTPException(status_code=404, detail="Interview not found")
#
#     history_query = select(ChatMessage).where(ChatMessage.interview_id == interview_id).order_by(ChatMessage.timestamp)
#     history_res = await db.execute(history_query)
#     history = [{"role": m.role, "content": m.content} for m in history_res.scalars().all()]
#
#     feedback = await AIService.generate_feedback(history)
#
#     interview.is_finished = True
#     interview.feedback = feedback
#     await db.commit()
#
#     return {"msg": "Interview finished", "feedback": feedback}

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.user import User
from app.models.interview import Interview, ChatMessage
from app.schemas.interview import InterviewCreate, InterviewResponse, MessageCreate
from app.services.ai_service import AIService

router = APIRouter(prefix="/interviews", tags=["Interviews"])


# --- ВСПОМОГАТЕЛЬНЫЕ МОДЕЛИ ---

# Модель ответа для пагинации
class PaginatedResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[InterviewResponse]


# Получение пользователя с проверкой существования
async def get_current_user(user_id: int = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)) -> User:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# --- ЭНДПОИНТЫ ---

@router.post("/", response_model=InterviewResponse)
async def start_interview(
        interview_data: InterviewCreate,
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Создать новое интервью и сгенерировать приветствие от ИИ.
    """
    new_interview = Interview(
        user_id=user.id,
        topic=interview_data.topic,
        level=interview_data.level
    )
    db.add(new_interview)
    await db.commit()
    await db.refresh(new_interview)

    # Генерируем приветствие
    welcome_text = f"Привет! Я твой интервьюер по теме {interview_data.topic} ({interview_data.level}). Готов начать?"
    welcome_msg = ChatMessage(
        interview_id=new_interview.id,
        role="ai",
        content=welcome_text
    )
    db.add(welcome_msg)
    await db.commit()

    # Перезапрашиваем объект с сообщениями для корректного ответа Pydantic
    query = (
        select(Interview)
        .options(selectinload(Interview.messages))
        .where(Interview.id == new_interview.id)
    )
    result = await db.execute(query)
    return result.scalars().first()


@router.get("/", response_model=PaginatedResponse)
async def get_interviews(
        page: int = Query(1, ge=1),
        size: int = Query(10, ge=1, le=50),
        topic: Optional[str] = None,
        level: Optional[str] = None,
        is_finished: Optional[bool] = None,
        sort_by: str = Query("created_at_desc", regex="^(created_at|topic)_(asc|desc)$"),
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Получить список интервью с фильтрацией, сортировкой и пагинацией.
    """
    # 1. Базовый запрос (только свои интервью)
    query = select(Interview).where(Interview.user_id == user.id)

    # 2. Фильтрация
    if topic:
        query = query.where(Interview.topic.ilike(f"%{topic}%"))
    if level:
        query = query.where(Interview.level == level)
    if is_finished is not None:
        query = query.where(Interview.is_finished == is_finished)

    # 3. Подсчет общего количества (для пагинации)
    count_query = select(func.count()).select_from(query.subquery())
    total_res = await db.execute(count_query)
    total = total_res.scalar_one()

    # 4. Сортировка
    if sort_by == "created_at_desc":
        query = query.order_by(Interview.created_at.desc())
    elif sort_by == "created_at_asc":
        query = query.order_by(Interview.created_at.asc())
    elif sort_by == "topic_asc":
        query = query.order_by(Interview.topic.asc())

    # 5. Пагинация
    query = query.offset((page - 1) * size).limit(size)

    # Не забываем подгружать сообщения, если они нужны в превью, или используем selectinload
    # Но для списка обычно сообщения не нужны, схема InterviewResponse их требует,
    # поэтому лучше подгрузить, чтобы не было ошибки MissingGreenlet
    query = query.options(selectinload(Interview.messages))

    result = await db.execute(query)
    items = result.scalars().all()

    return {
        "total": total,
        "page": page,
        "size": size,
        "items": items
    }


@router.get("/{interview_id}", response_model=InterviewResponse)
async def get_interview(
        interview_id: int,
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Получить конкретное интервью.
    RBAC: Админ видит всё, Юзер видит только свое.
    """
    query = select(Interview).options(selectinload(Interview.messages)).where(Interview.id == interview_id)

    # Если не админ — проверяем владельца
    if user.role != "admin":
        query = query.where(Interview.user_id == user.id)

    result = await db.execute(query)
    interview = result.scalars().first()

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found or access denied")
    return interview


@router.get("/user/{target_user_id}", response_model=List[InterviewResponse])
async def get_user_interviews_admin(
        target_user_id: int,
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    (Admin Only) Получить все интервью конкретного пользователя.
    """
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")

    query = (
        select(Interview)
        .options(selectinload(Interview.messages))
        .where(Interview.user_id == target_user_id)
        .order_by(Interview.created_at.desc())
    )
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/{interview_id}/chat")
async def chat_interview(
        interview_id: int,
        message: MessageCreate,
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Отправить сообщение и получить ответ от ИИ.
    """
    interview = await db.get(Interview, interview_id)

    # Писать может только владелец
    if not interview or interview.user_id != user.id:
        raise HTTPException(status_code=404, detail="Interview not found")
    if interview.is_finished:
        raise HTTPException(status_code=400, detail="Interview is finished")

    # 1. Сохраняем сообщение юзера
    user_msg = ChatMessage(interview_id=interview_id, role="user", content=message.content)
    db.add(user_msg)
    await db.commit()

    # 2. Получаем историю для контекста ИИ
    history_query = select(ChatMessage).where(ChatMessage.interview_id == interview_id).order_by(ChatMessage.timestamp)
    history_res = await db.execute(history_query)
    history = [{"role": m.role, "content": m.content} for m in history_res.scalars().all()]

    # 3. Генерируем ответ
    ai_response_text = await AIService.get_chat_response(history)

    # 4. Сохраняем ответ ИИ
    ai_msg = ChatMessage(interview_id=interview_id, role="ai", content=ai_response_text)
    db.add(ai_msg)
    await db.commit()

    return {"user_message": message.content, "ai_message": ai_response_text}


@router.post("/{interview_id}/finish")
async def finish_interview(
        interview_id: int,
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Завершить интервью и сгенерировать фидбэк.
    """
    interview = await db.get(Interview, interview_id)
    if not interview or interview.user_id != user.id:
        raise HTTPException(status_code=404, detail="Interview not found")

    history_query = select(ChatMessage).where(ChatMessage.interview_id == interview_id).order_by(ChatMessage.timestamp)
    history_res = await db.execute(history_query)
    history = [{"role": m.role, "content": m.content} for m in history_res.scalars().all()]

    feedback = await AIService.generate_feedback(history)

    interview.is_finished = True
    interview.feedback = feedback
    await db.commit()

    return {"msg": "Interview finished", "feedback": feedback}


@router.delete("/{interview_id}")
async def delete_interview(
        interview_id: int,
        user: User = Depends(get_current_user),
        db: AsyncSession = Depends(get_db)
):
    """
    Удалить интервью.
    """
    interview = await db.get(Interview, interview_id)
    if not interview or interview.user_id != user.id:
        raise HTTPException(status_code=404, detail="Not found")

    await db.delete(interview)
    await db.commit()
    return {"msg": "Deleted"}