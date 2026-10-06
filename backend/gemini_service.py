import google.generativeai as genai
import os
import json
import re

from dotenv import load_dotenv


load_dotenv()


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError(
        "GEMINI_API_KEY is not configured."
    )


genai.configure(
    api_key=GEMINI_API_KEY
)


model = genai.GenerativeModel(
    "gemini-2.5-flash"
)


def parse_json_response(text: str):

    text = text.strip()

    # Remove markdown code blocks if Gemini returns them
    text = re.sub(
        r"^```json\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"^```\s*",
        "",
        text
    )

    text = re.sub(
        r"\s*```$",
        "",
        text
    )

    return json.loads(text)


def analyze_resume(resume_text):

    prompt = f"""
Analyze the following resume.

Return ONLY valid JSON.

Resume:
{resume_text}

Use exactly this format:

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
"""


    response = model.generate_content(prompt)

    return parse_json_response(
        response.text
    )


def generate_questions(
    resume_text,
    role,
    difficulty
):

    prompt = f"""
You are an AI Interviewer.

Generate EXACTLY 10 interview questions.

Candidate Resume:
{resume_text}

Target Role:
{role}

Difficulty:
{difficulty}

Requirements:
- Questions must be relevant to the candidate's resume.
- Include project-based questions.
- Include technical questions.
- Include scenario-based questions.
- Match the selected role.
- Match the selected difficulty.
- Do not provide answers.
- Do not provide explanations.

Return ONLY valid JSON:

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

    return parse_json_response(
        response.text
    )


def evaluate_answer(
    question,
    answer
):

    prompt = f"""
Evaluate this interview answer.

Question:
{question}

Candidate Answer:
{answer}

Evaluate the answer fairly.

Return ONLY valid JSON:

{{
    "score": 0,
    "strengths": [
        "strength1"
    ],
    "weaknesses": [
        "weakness1"
    ],
    "improved_answer": "A better version of the candidate answer."
}}

Rules:
- Score must be an integer from 0 to 10.
- Give useful strengths.
- Give useful weaknesses.
- Provide a realistic improved answer.
- Return ONLY JSON.
- No markdown.
"""


    response = model.generate_content(prompt)

    return parse_json_response(
        response.text
    )