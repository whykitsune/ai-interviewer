from pydantic import BaseModel

class InterviewStart(BaseModel):
    topic: str
    level: str

class InterviewChat(BaseModel):
    message: str

class InterviewOut(BaseModel):
    id: int
    topic: str
    level: str
    status: str

    class Config:
        orm_mode = True
