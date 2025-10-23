from sqlalchemy import Column, Integer, String, ForeignKey, Float
from app.db.base import Base

class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    text = Column(String, nullable=False)
    score = Column(Float, nullable=True)
