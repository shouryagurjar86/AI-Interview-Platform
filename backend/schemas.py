from pydantic import BaseModel, EmailStr, Field


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class QuestionRequest(BaseModel):
    role: str
    difficulty: str
    resume: str


class AnswerRequest(BaseModel):
    user_id: int
    question: str
    answer: str = Field(min_length=1)