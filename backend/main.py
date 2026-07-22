from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, get_db, Base
from models import ProblemDB, UserDB
from auth import hash_password, verify_password, create_access_token, get_current_user
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, timedelta
from typing import Optional


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Problem(BaseModel):
    name: str
    company: str = ""
    topic: str = ""
    link: str = ""


class UserCreate(BaseModel):
    email: str
    password: str


@app.get("/")
def read_root():
    return {"message": "Tracker API is running"}


@app.get("/problems")
def list_problems(
    due_within: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: UserDB = Depends(get_current_user)
):
    query = db.query(ProblemDB).filter(ProblemDB.owner_id == current_user.id)

    if due_within is not None:
        cutoff = date.today() + timedelta(days=due_within)
        query = query.filter(ProblemDB.next_review <= cutoff)

    return query.all()


@app.post("/problems")
def add_problem(problem: Problem, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    db_problem = ProblemDB(
        owner_id=current_user.id,
        name=problem.name,
        company=problem.company,
        topic=problem.topic,
        link=problem.link,
    )
    db.add(db_problem)
    db.commit()
    db.refresh(db_problem)
    return db_problem


@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(UserDB).filter(UserDB.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = UserDB(email=user.email, hashed_password=hash_password(user.password))
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email}


@app.post("/login")
def login(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(UserDB).filter(UserDB.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}

class ReviewInput(BaseModel):
    level: str  # "again", "hard", "good", or "easy"

INTERVALS = {"again": 1, "hard": 3, "good": 7, "easy": 14}

@app.patch("/problems/{problem_id}/review")
def review_problem(problem_id: int, review: ReviewInput, db: Session = Depends(get_db), current_user: UserDB = Depends(get_current_user)):
    problem = db.query(ProblemDB).filter(
        ProblemDB.id == problem_id,
        ProblemDB.owner_id == current_user.id
    ).first()

    if not problem:
        raise HTTPException(status_code=404, detail="Problem not found")

    days = INTERVALS[review.level]
    problem.next_review = date.today() + timedelta(days=days)
    problem.review_count += 1

    db.commit()
    db.refresh(problem)
    return problem