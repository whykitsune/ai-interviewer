from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class InterviewCreate(BaseModel):
    topic: str
    level: str


class MessageCreate(BaseModel):
    content: str


class MessageResponse(BaseModel):
    role: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True


class InterviewResponse(BaseModel):
    id: int
    topic: str
    level: str
    is_finished: bool
    feedback: Optional[str]
    created_at: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True
