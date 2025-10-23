from pydantic import BaseModel

class FeedbackOut(BaseModel):
    id: int
    text: str
    score: float | None = None

    class Config:
        orm_mode = True
