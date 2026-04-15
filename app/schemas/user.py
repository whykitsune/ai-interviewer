from pydantic import BaseModel, EmailStr, validator


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    resume_path: str | None = None
    role: str

    class Config:
        from_attributes = True

    @validator("resume_path", pre=True, check_fields=False)
    def convert_path_to_url(cls, value):
        if value:
            url = value.replace("app/static", "http://127.0.0.1:8000/static")

            url = url.replace("\\", "/")

            return url
        return None


class UserRoleUpdate(BaseModel):
    role: str
