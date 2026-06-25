import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-2.5-flash")

print(os.getenv("GEMINI_API_KEY"))


def analyze_resume(resume_text):

    prompt = f"""
    Analyze this resume and return ONLY valid JSON.

    Resume:
    {resume_text}

    Format:

    {{
        "skills": [
            "skill1",
            "skill2"
        ],
        "strengths": [
            "strength1",
            "strength2"
        ],
        "weaknesses": [
            "weakness1",
            "weakness2"
        ],
        "recommended_roles": [
            "role1",
            "role2"
        ]
    }}

    Rules:
    - Return ONLY JSON
    - No markdown
    - No explanation outside JSON
    - No ```json blocks
    """

    response = model.generate_content(prompt)

    return json.loads(response.text)

def generate_questions(resume_text, role, difficulty):

    prompt = f"""
You are an AI Interviewer.

Generate EXACTLY 10 interview questions in VALID JSON.

Candidate Resume:
{resume_text}

Target Role:
{role}

Difficulty:
{difficulty}

Requirements:
- Focus on the candidate's skills.
- Ask questions related to projects.
- Include scenario-based questions.
- Include technical questions.
- No explanations.
- No markdown.
- No code block.

Return ONLY this JSON format:

{{
    "questions": [
        "Question 1",
        "Question 2",
        "Question 3",
        "Question 4",
        "Question 5",
        "Question 6",
        "Question 7",
        "Question 8",
        "Question 9",
        "Question 10"
    ]
}}
"""

    response = model.generate_content(prompt)

    # Parse Gemini's JSON response
    data = json.loads(response.text)

    return data

def evaluate_answer(question, answer):

    prompt = f"""
    Evaluate this interview answer.

    Question:
    {question}

    Answer:
    {answer}

    Return ONLY valid JSON.

    {{
        "score": 0,
        "strengths": [
            ""
        ],
        "weaknesses": [
            ""
        ],
        "improved_answer": ""
    }}

    Do not include markdown.
    Do not include ```json.
    Return only JSON.
    """

    response = model.generate_content(prompt)

    return json.loads(response.text)