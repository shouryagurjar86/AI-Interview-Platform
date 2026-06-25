from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    name:str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class QuestionRequest(BaseModel):
    role: str
    difficulty: str
    resume: str

class AnswerRequest(BaseModel):
    question: str
    answer: str