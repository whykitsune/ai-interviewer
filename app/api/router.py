from fastapi import APIRouter
from app.api.routes import auth, user, resume, interview, feedback

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(user.router, prefix="/user", tags=["User"])
api_router.include_router(resume.router, prefix="/resume", tags=["Resume"])
api_router.include_router(interview.router, prefix="/interview", tags=["Interview"])
api_router.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])