from datetime import datetime, date
from database1 import Base
from sqlalchemy import Column, DateTime, Date, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    problems = relationship("Problem", back_populates="owner")

class Problem(Base):
    __tablename__ = "problems"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    difficulty = Column(String)
    link = Column(String)
    topic = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="problems")
    review_data = relationship("Reviewdata", back_populates="problems", uselist=False)


class Reviewdata(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True)
    problem_id = Column(Integer, ForeignKey("problems.id"), unique=True)
    easiness = Column(Float, default=2.5)
    repetition = Column(Integer, default=0)
    interval_days = Column(Integer, default=1)
    next_review_date = Column(Date, default=date.today)
    ext_review = Column(DateTime, default=datetime.utcnow)
    problems = relationship("Problem", back_populates="review_data")
    logs = relationship("ReviewLog", back_populates="review_problem")


class ReviewLog(Base):
    __tablename__ = "reviews_log"
    id = Column(Integer, primary_key=True)
    review_problem_id = Column(Integer, ForeignKey("reviews.id"))
    quality = Column(Integer)
    reviewed_at = Column(DateTime, default=datetime.utcnow)
    review_problem = relationship("Reviewdata", back_populates="logs")




