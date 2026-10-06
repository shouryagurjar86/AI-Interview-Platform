from fastapi import (
    FastAPI,
    Depends,
    HTTPException,
    UploadFile,
    File,
    Form
)

from fastapi.middleware.cors import CORSMiddleware

from sqlalchemy.orm import Session

from database import SessionLocal

from models import (
    User,
    Resume,
    InterviewResult
)

from schemas import (
    UserCreate,
    UserLogin,
    AnswerRequest
)

from auth import (
    hash_password,
    verify_password
)

from resume_parser import (
    extract_text_from_pdf
)

from gemini_service import (
    analyze_resume,
    generate_questions,
    evaluate_answer
)

import os


app = FastAPI(
    title="InterviewAI API"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "https://ai-interview-platform-mi50f4lfs-shourya4.vercel.app/",
        "https://ai-interview-platform-shourya4.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# --------------------------------------------------
# DATABASE
# --------------------------------------------------

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()


# --------------------------------------------------
# HELPERS
# --------------------------------------------------

UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


def get_user(
    user_id: int,
    db: Session
):

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return user


def get_resume_path(user_id: int):

    return os.path.join(
        UPLOAD_DIR,
        f"user_{user_id}_resume.pdf"
    )


# --------------------------------------------------
# HOME
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "message": "AI Interview Platform Backend Running"
    }


# --------------------------------------------------
# SIGNUP
# --------------------------------------------------

@app.post("/signup")
def signup(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    email = user.email.lower().strip()

    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )


    new_user = User(

        name=user.name.strip(),

        email=email,

        password=hash_password(
            user.password
        )
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


# --------------------------------------------------
# LOGIN
# --------------------------------------------------

@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    email = user.email.lower().strip()

    existing_user = db.query(User).filter(
        User.email == email
    ).first()


    if not existing_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )


    if not verify_password(
        user.password,
        existing_user.password
    ):

        raise HTTPException(
            status_code=401,
            detail="Incorrect password"
        )


    return {

        "message": "Login successful",

        "user_id": existing_user.id,

        "name": existing_user.name,

        "email": existing_user.email
    }


# --------------------------------------------------
# GET USER
# --------------------------------------------------

@app.get("/me/{user_id}")
def get_me(
    user_id: int,
    db: Session = Depends(get_db)
):

    user = get_user(
        user_id,
        db
    )

    return {

        "id": user.id,

        "name": user.name,

        "email": user.email,

        "created_at": user.created_at
    }


# --------------------------------------------------
# UPLOAD RESUME
# --------------------------------------------------

@app.post("/upload-resume")
async def upload_resume(
    user_id: int = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):

    get_user(
        user_id,
        db
    )


    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected"
        )


    if not file.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed"
        )


    contents = await file.read()


    if len(contents) > 10 * 1024 * 1024:

        raise HTTPException(
            status_code=400,
            detail="File size must be below 10 MB"
        )


    file_path = get_resume_path(
        user_id
    )


    with open(
        file_path,
        "wb"
    ) as buffer:

        buffer.write(contents)


    resume = Resume(

        user_id=user_id,

        file_name=file.filename,

        file_path=file_path
    )


    db.add(resume)

    db.commit()


    return {

        "message": "Resume uploaded successfully",

        "file_name": file.filename
    }


# --------------------------------------------------
# ANALYZE RESUME
# --------------------------------------------------

@app.post("/analyze-resume")
async def analyze_uploaded_resume(
    user_id: int,
    db: Session = Depends(get_db)
):

    get_user(
        user_id,
        db
    )


    resume_path = get_resume_path(
        user_id
    )


    if not os.path.exists(
        resume_path
    ):

        raise HTTPException(
            status_code=404,
            detail="Please upload a resume first"
        )


    try:

        resume_text = extract_text_from_pdf(
            resume_path
        )

        if not resume_text.strip():

            raise HTTPException(
                status_code=400,
                detail="Could not extract text from this PDF"
            )


        analysis = analyze_resume(
            resume_text
        )


        return {
            "analysis": analysis
        }


    except HTTPException:

        raise


    except Exception as e:

        print(
            "RESUME ANALYSIS ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Resume analysis failed"
        )


# --------------------------------------------------
# GENERATE QUESTIONS
# --------------------------------------------------

@app.post("/generate-questions")
async def generate_interview_questions(

    user_id: int = Form(...),

    resume: UploadFile = File(...),

    role: str = Form(...),

    difficulty: str = Form(...),

    db: Session = Depends(get_db)
):

    get_user(
        user_id,
        db
    )


    if not resume.filename.lower().endswith(".pdf"):

        raise HTTPException(
            status_code=400,
            detail="Only PDF resumes are allowed"
        )


    contents = await resume.read()


    if len(contents) > 10 * 1024 * 1024:

        raise HTTPException(
            status_code=400,
            detail="File size must be below 10 MB"
        )


    resume_path = get_resume_path(
        user_id
    )


    with open(
        resume_path,
        "wb"
    ) as buffer:

        buffer.write(contents)


    resume_text = extract_text_from_pdf(
        resume_path
    )


    if not resume_text.strip():

        raise HTTPException(
            status_code=400,
            detail="Could not extract text from resume"
        )


    questions = generate_questions(

        resume_text,

        role,

        difficulty
    )


    return questions


# --------------------------------------------------
# EVALUATE ANSWER
# --------------------------------------------------

@app.post("/evaluate-answer")
async def evaluate_interview_answer(

    request: AnswerRequest,

    db: Session = Depends(get_db)
):

    get_user(
        request.user_id,
        db
    )


    try:

        result = evaluate_answer(

            request.question,

            request.answer
        )


        score = int(
            result["score"]
        )


        score = max(
            0,
            min(10, score)
        )


        interview = InterviewResult(

            user_id=request.user_id,

            question=request.question,

            answer=request.answer,

            score=score,

            feedback=result.get(
                "improved_answer",
                ""
            )
        )


        db.add(interview)

        db.commit()

        db.refresh(interview)


        return {

            "id": interview.id,

            "score": score,

            "strengths": result.get(
                "strengths",
                []
            ),

            "weaknesses": result.get(
                "weaknesses",
                []
            ),

            "improved_answer": result.get(
                "improved_answer",
                ""
            )
        }


    except Exception as e:

        db.rollback()

        print(
            "EVALUATION ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=500,
            detail="Answer evaluation failed"
        )


# --------------------------------------------------
# INTERVIEW HISTORY
# --------------------------------------------------

@app.get("/interview-history")
def get_interview_history(

    user_id: int,

    db: Session = Depends(get_db)
):

    get_user(
        user_id,
        db
    )


    results = db.query(
        InterviewResult
    ).filter(
        InterviewResult.user_id == user_id
    ).order_by(
        InterviewResult.created_at.desc()
    ).all()


    return [

        {

            "id": result.id,

            "question": result.question,

            "answer": result.answer,

            "score": result.score,

            "feedback": result.feedback,

            "created_at": result.created_at

        }

        for result in results
    ]


# --------------------------------------------------
# DELETE INTERVIEW RESULT
# --------------------------------------------------

@app.delete("/interview-history/{result_id}")
def delete_interview_result(

    result_id: int,

    user_id: int,

    db: Session = Depends(get_db)
):

    result = db.query(
        InterviewResult
    ).filter(

        InterviewResult.id == result_id,

        InterviewResult.user_id == user_id

    ).first()


    if not result:

        raise HTTPException(
            status_code=404,
            detail="Interview result not found"
        )


    db.delete(result)

    db.commit()


    return {
        "message": "Interview result deleted"
    }


# --------------------------------------------------
# DASHBOARD STATS
# --------------------------------------------------

@app.get("/dashboard-stats")
def dashboard_stats(

    user_id: int,

    db: Session = Depends(get_db)
):

    get_user(
        user_id,
        db
    )


    results = db.query(
        InterviewResult
    ).filter(
        InterviewResult.user_id == user_id
    ).all()


    total = len(results)


    average = (

        sum(
            result.score
            for result in results
        ) / total

        if total > 0

        else 0
    )


    highest = (

        max(
            result.score
            for result in results
        )

        if total > 0

        else 0
    )


    return {

        "total_questions": total,

        "average_score": round(
            average,
            1
        ),

        "highest_score": highest
    }


# --------------------------------------------------
# RESUMES
# --------------------------------------------------

@app.get("/resumes")
def get_resumes(

    user_id: int,

    db: Session = Depends(get_db)
):

    get_user(
        user_id,
        db
    )


    resumes = db.query(
        Resume
    ).filter(
        Resume.user_id == user_id
    ).order_by(
        Resume.uploaded_at.desc()
    ).all()


    return {

        "resumes": [

            {

                "id": resume.id,

                "file_name": resume.file_name,

                "uploaded_at": resume.uploaded_at

            }

            for resume in resumes
        ]
    }