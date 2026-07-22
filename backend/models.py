from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base
from datetime import date
from sqlalchemy import Column, Integer, String, ForeignKey, Date


class UserDB(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)


class ProblemDB(Base):
    __tablename__ = "problems"
    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    company = Column(String, default="")
    topic = Column(String, default="")
    next_review = Column(Date, default=date.today)
    review_count = Column(Integer, default=0)
    link = Column(String, default="")