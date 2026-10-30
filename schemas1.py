from datetime import datetime, date
from pydantic import BaseModel, ConfigDict

class UserCreate(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None

    
class ProblemCreate(BaseModel):
    name: str
    difficulty: str
    link: str
    topic: str


class ReviewLogResponse(BaseModel):
    id: int
    review_problem_id: int
    quality: int
    reviewed_at: datetime
    model_config = ConfigDict(from_attributes=True)


class ReviewDataResponse(BaseModel):
    id: int
    problem_id: int
    easiness: float
    repetition: int
    interval_days: int
    next_review_date: date
    ext_review: datetime
    logs: list[ReviewLogResponse] = []
    model_config = ConfigDict(from_attributes=True)


class ProblemResponse(BaseModel):
    id: int
    name: str
    difficulty: str
    link: str
    topic: str
    review_data: ReviewDataResponse | None = None
    model_config = ConfigDict(from_attributes=True)
    


    
    



    
