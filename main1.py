from datetime import date, datetime, timedelta
from typing import List

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from models1 import User, Problem, Reviewdata, ReviewLog
from schemas1 import UserCreate, UserResponse, Token, ProblemCreate, ProblemResponse, ReviewDataResponse
from auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    create_access_token,
    get_current_user,
    get_password_hash,
    verify_password,
)
from database1 import Base, engine, get_db
from sm2 import calculate_sm2

app = FastAPI(title="Flashcard & Problem Tracker API")
Base.metadata.create_all(bind=engine)


# ==========================================
# 1. AUTHENTICATION ENDPOINTS
# ==========================================

@app.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_pwd = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_pwd)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/login", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/users/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


# ==========================================
# 2. PROTECTED PROBLEM ENDPOINTS
# ==========================================

@app.post("/problems/", response_model=ProblemResponse)
def create_problem(
    problem: ProblemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing_problem = (
        db.query(Problem)
        .filter(Problem.name == problem.name, Problem.owner_id == current_user.id)
        .first()
    )
    if existing_problem:
        raise HTTPException(status_code=400, detail="Problem already exists for this user")

    new_problem = Problem(**problem.dict(), owner_id=current_user.id)
    db.add(new_problem)
    db.commit()
    db.refresh(new_problem)

    new_review = Reviewdata(
        problem_id=new_problem.id,
        easiness=2.5,
        repetition=0,
        interval_days=1,
        next_review_date=date.today(),
        ext_review=datetime.utcnow()
    )
    db.add(new_review)
    db.commit()

    db.refresh(new_problem)
    return new_problem


@app.get("/problems/{problems_id}", response_model=ProblemResponse)
def access_problem(
    problems_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    problem_info = (
        db.query(Problem)
        .filter(Problem.id == problems_id, Problem.owner_id == current_user.id)
        .first()
    )
    if not problem_info:
        raise HTTPException(status_code=404, detail="Problem doesn't exist or unauthorized access")
    return problem_info


@app.get("/problems/", response_model=List[ProblemResponse])
def all_problem(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Problem).filter(Problem.owner_id == current_user.id).all()


@app.put("/problems/{problem_id}", response_model=ProblemResponse)
def update_problem(
    problem_id: int,
    problem: ProblemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    problem_user = (
        db.query(Problem)
        .filter(Problem.id == problem_id, Problem.owner_id == current_user.id)
        .first()
    )
    if not problem_user:
        raise HTTPException(status_code=404, detail="Problem doesn't exist or unauthorized access")

    for field, value in problem.dict().items():
        setattr(problem_user, field, value)

    db.commit()
    db.refresh(problem_user)
    return problem_user


@app.delete("/problems/{problem_id}")
def delete_problem(
    problem_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    problem_del = (
        db.query(Problem)
        .filter(Problem.id == problem_id, Problem.owner_id == current_user.id)
        .first()
    )
    if not problem_del:
        raise HTTPException(status_code=404, detail="Problem doesn't exist or unauthorized access")

    db.delete(problem_del)
    db.commit()
    return {"message": "Problem deleted successfully"}


# ==========================================
# 3. PROTECTED SPACED-REPETITION (SM2) ENDPOINTS
# ==========================================

@app.post("/cards/{card_id}/review", response_model=ReviewDataResponse)
def create_problem_review(
    card_id: int,
    quality: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    card = (
        db.query(Reviewdata)
        .join(Problem)
        .filter(Reviewdata.id == card_id, Problem.owner_id == current_user.id)
        .first()
    )
    if not card:
        raise HTTPException(status_code=404, detail="Card doesn't exist or unauthorized access")

    new_repetition, new_ease, new_interval = calculate_sm2(
        quality, card.repetition, card.easiness, card.interval_days
    )
    card.repetition = new_repetition
    card.easiness = new_ease
    card.interval_days = new_interval
    card.next_review_date = date.today() + timedelta(days=new_interval)

    new_log = ReviewLog(review_problem_id=card.id, quality=quality, reviewed_at=datetime.utcnow())
    db.add(new_log)

    db.commit()
    db.refresh(card)
    return card


@app.get("/cards/due", response_model=List[ReviewDataResponse])
def get_due_cards(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cards = (
        db.query(Reviewdata)
        .join(Problem)
        .filter(
            Problem.owner_id == current_user.id,
            Reviewdata.next_review_date <= date.today()
        )
        .all()
    )
    return cards


