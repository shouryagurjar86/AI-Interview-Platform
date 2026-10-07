from fastapi import FastAPI, Depends, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os

from database import SessionLocal
from models import User, InterviewResult

from schemas import (
    UserCreate,
    UserLogin,
    AnswerRequest,
)

from auth import (
    hash_password,
    verify_password,
)

from resume_parser import extract_text_from_pdf

from gemini_service import (
    generate_questions,
    analyze_resume,
    evaluate_answer,
)


app = FastAPI()


# =========================================================
# CORS CONFIGURATION
# =========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "https://ai-interview-platform-mi50f4lfs-shourya4.vercel.app",
        "https://ai-interview-platform-shourya4.vercel.app",
        "https://ai-interview-platform-orcin-tau.vercel.app",
    ],

    allow_origin_regex=r"https://ai-interview-platform-[a-z0-9-]+-shourya4\.vercel\.app",

    allow_credentials=False,

    allow_methods=["*"],

    allow_headers=["*"],

    max_age=600,
)


# =========================================================
# DATABASE
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():

    return {
        "message": "AI Interview Platform Backend Running"
    }


# =========================================================
# SIGNUP
# =========================================================

@app.post("/signup")
def signup(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:

        return {
            "error": "Email already registered"
        }

    new_user = User(
        name=user.name,
        email=user.email,
        password=hash_password(user.password)
    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id,
        "name": new_user.name,
        "email": new_user.email
    }


# =========================================================
# LOGIN
# =========================================================

@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:

        return {
            "error": "User not found"
        }

    if not verify_password(
        user.password,
        existing_user.password
    ):

        return {
            "error": "Incorrect password"
        }

    return {
        "message": "Login successful",
        "user_id": existing_user.id,
        "name": existing_user.name,
        "email": existing_user.email
    }


# =========================================================
# UPLOAD RESUME
# =========================================================

@app.post("/upload-resume")
async def upload_resume(
    file: UploadFile = File(...)
):

    try:

        upload_dir = "uploads"

        os.makedirs(
            upload_dir,
            exist_ok=True
        )

        file_path = os.path.join(
            upload_dir,
            "current_resume.pdf"
        )

        with open(
            file_path,
            "wb"
        ) as buffer:

            buffer.write(
                await file.read()
            )

        return {
            "message": "Resume uploaded successfully"
        }

    except Exception as e:

        print(
            "UPLOAD ERROR:",
            e
        )

        return {
            "error": str(e)
        }


# =========================================================
# ANALYZE RESUME
# =========================================================

@app.post("/analyze-resume")
async def analyze_uploaded_resume():

    print(
        "ANALYZE ENDPOINT HIT"
    )

    resume_path = os.path.join(
        "uploads",
        "current_resume.pdf"
    )

    resume_text = extract_text_from_pdf(
        resume_path
    )

    print(
        "PDF EXTRACTED"
    )

    analysis = analyze_resume(
        resume_text
    )

    print(
        "GEMINI FINISHED"
    )

    return {
        "analysis": analysis
    }


# =========================================================
# GENERATE INTERVIEW QUESTIONS
# =========================================================

@app.post("/generate-questions")
async def generate_interview_questions(
    resume: UploadFile = File(...),
    role: str = Form(...),
    difficulty: str = Form(...)
):

    os.makedirs(
        "uploads",
        exist_ok=True
    )

    resume_path = os.path.join(
        "uploads",
        "current_resume.pdf"
    )

    with open(
        resume_path,
        "wb"
    ) as buffer:

        buffer.write(
            await resume.read()
        )

    resume_text = extract_text_from_pdf(
        resume_path
    )

    questions = generate_questions(
        resume_text,
        role,
        difficulty
    )

    return questions


# =========================================================
# EVALUATE ANSWER
# =========================================================

@app.post("/evaluate-answer")
async def evaluate_interview_answer(
    request: AnswerRequest,
    db: Session = Depends(get_db)
):

    result = evaluate_answer(
        request.question,
        request.answer
    )

    interview = InterviewResult(
        user_id=1,
        question=request.question,
        answer=request.answer,
        score=result["score"],
        feedback=result["improved_answer"]
    )

    db.add(interview)

    db.commit()

    return result


# =========================================================
# INTERVIEW HISTORY
# =========================================================

@app.get("/interview-history")
def get_interview_history(
    db: Session = Depends(get_db)
):

    results = db.query(
        InterviewResult
    ).all()

    return results


# =========================================================
# DASHBOARD STATS
# =========================================================

@app.get("/dashboard-stats")
def dashboard_stats(
    db: Session = Depends(get_db)
):

    results = db.query(
        InterviewResult
    ).all()

    total = len(results)

    avg_score = (
        sum(
            r.score
            for r in results
        ) / total
        if total > 0
        else 0
    )

    highest = (
        max(
            r.score
            for r in results
        )
        if total > 0
        else 0
    )

    return {
        "total_questions": total,
        "average_score": round(
            avg_score,
            2
        ),
        "highest_score": highest
    }


# =========================================================
# RESUMES
# =========================================================

@app.get("/resumes")
def get_resumes():

    upload_dir = "uploads"

    if not os.path.exists(
        upload_dir
    ):

        return {
            "resumes": []
        }

    files = [
        file
        for file in os.listdir(
            upload_dir
        )
        if file.endswith(".pdf")
    ]

    return {
        "resumes": files
    }