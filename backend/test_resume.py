from resume_parser import extract_text_from_pdf
from gemini_service import analyze_resume

resume_text = extract_text_from_pdf(
    "uploads/Shourya_Gurjar_Resume.pdf"
)

analysis = analyze_resume(resume_text)

print(analysis)