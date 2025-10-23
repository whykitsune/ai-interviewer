from pydantic import BaseModel

class ResumeOut(BaseModel):
    id: int
    file_path: str

    class Config:
        orm_mode = True
