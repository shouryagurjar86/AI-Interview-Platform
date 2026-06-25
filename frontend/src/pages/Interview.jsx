import { useState, useEffect, useRef } from "react";
import { generateQuestions, getResumes } from "../services/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ── helpers ──────────────────────────────────────────────────────
const scoreClass  = (s) => s >= 7 ? "score-high"  : s >= 4 ? "score-mid"  : "score-low";
const fillClass   = (s) => s >= 7 ? "fill-high"   : s >= 4 ? "fill-mid"   : "fill-low";
const numClass    = (s) => s >= 7 ? "done"         : s >= 4 ? "done-mid"   : "done-low";

function ScoreRing({ score }) {
  return (
    <div className={`eval-score-ring ${scoreClass(score)}`}>
      {score}/10
    </div>
  );
}

function EvalPanel({ result }) {
  const pct = (result.score / 10) * 100;
  return (
    <div className="eval-panel">
      {/* Score bar */}
      <div className="eval-score-bar">
        <ScoreRing score={result.score} />
        <div className="eval-score-label">
          <span>
            {result.score >= 7 ? "Strong answer" : result.score >= 4 ? "Decent — room to grow" : "Needs improvement"}
          </span>
          <div className="eval-progress-track">
            <div
              className={`eval-progress-fill ${fillClass(result.score)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Strengths + Weaknesses */}
      <div className="eval-sections">
        <div className="eval-section">
          <div className="eval-section-title">
            <span>✓</span> What worked
          </div>
          <ul>
            {(result.strengths || []).map((s, i) => (
              <li key={i}>
                <span className="eval-dot green" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="eval-section">
          <div className="eval-section-title">
            <span>△</span> Areas to improve
          </div>
          <ul>
            {(result.weaknesses || []).map((w, i) => (
              <li key={i}>
                <span className="eval-dot amber" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Improved answer */}
      {result.improved_answer && (
        <div className="eval-improved">
          <div className="eval-improved-title">
            <span>✦</span> Model answer
          </div>
          <p className="eval-improved-text">{result.improved_answer}</p>
        </div>
      )}
    </div>
  );
}

// ── main component ────────────────────────────────────────────────
function Interview() {
  const [questions,       setQuestions]       = useState([]);
  const [answers,         setAnswers]         = useState({});   // { index: string }
  const [evaluations,     setEvaluations]     = useState({});   // { index: result }
  const [evalLoading,     setEvalLoading]     = useState({});   // { index: bool }

  const [loading,         setLoading]         = useState(false);
  const [role,            setRole]            = useState("Software Engineer");
  const [difficulty,      setDifficulty]      = useState("Intermediate");
  const [resume, setResume] = useState(null);
  const [error,           setError]           = useState("");

  const questionsRef = useRef(null);
  const navigate     = useNavigate();

  

  // Generate questions
  const handleGenerate = async () => {
    if (!resume) {
      setError("Please upload a resume first via the Resume Analysis page.");
      return;
    }
    setError("");
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setEvaluations({});
    try {
      const formData = new FormData();

      formData.append("resume", resume);
      formData.append("role", role);
      formData.append("difficulty", difficulty);

      const res = await generateQuestions(formData);
      setQuestions(res.data.questions || []);
      setTimeout(() => questionsRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
    } catch {
      setError("Failed to generate questions. Make sure your backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // Submit a single answer for evaluation
  const handleEvaluate = async (index) => {
    const answer = (answers[index] || "").trim();
    if (!answer) return;

    setEvalLoading((prev) => ({ ...prev, [index]: true }));
    try {
      const res = await axios.post("https://beata-nontheoretic-weldon.ngrok-free.dev/evaluate-answer", {
        question: questions[index],
        answer,
      });
      setEvaluations((prev) => ({ ...prev, [index]: res.data }));
    } catch {
      setEvaluations((prev) => ({
        ...prev,
        [index]: { score: 0, strengths: [], weaknesses: ["Evaluation failed — check your backend."], improved_answer: "" },
      }));
    } finally {
      setEvalLoading((prev) => ({ ...prev, [index]: false }));
    }
  };

  // ── derived stats ──────────────────────────────────────────────
  const answeredCount = Object.keys(evaluations).length;
  const avgScore = answeredCount > 0
    ? Math.round(Object.values(evaluations).reduce((s, e) => s + e.score, 0) / answeredCount * 10) / 10
    : null;
  const bestScore = answeredCount > 0
    ? Math.max(...Object.values(evaluations).map((e) => e.score))
    : null;

  return (
    <div className="interview-page">

      {/* Nav */}
      <nav className="topnav">
        <div className="topnav-logo">
          <div className="topnav-logo-icon">🎯</div>
          <span>InterviewAI</span>
        </div>
        <div className="topnav-right">
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              background: "transparent",
              border: "1px solid var(--border-md)",
              borderRadius: "8px",
              padding: "7px 16px",
              color: "var(--text-secondary)",
              fontSize: "14px",
              cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}
          >
            ← Dashboard
          </button>
        </div>
      </nav>

      <div className="interview-layout">

        {/* Header */}
        <div className="page-header">
          <div className="page-header-eyebrow">Step 2</div>
          <h1>Interview Practice</h1>
          <p>
            Configure your session, generate questions, then type your answer under each one and hit <strong style={{ color: "var(--indigo-lt)" }}>Evaluate</strong> for instant AI feedback.
          </p>
        </div>

        {/* Config panel */}
        <div className="config-panel">
          <h2>Session Setup</h2>
          <div className="config-grid">

           <div className="config-field">

            <label>Upload Resume (PDF)</label>

            <div className="file-upload-box">

              <input
                type="file"
                accept=".pdf"
                  onChange={(e) => setResume(e.target.files[0])}
                />

                </div>

               {
                 resume && (
                    <p className="resume-name">
                      📄 {resume.name}
                      </p>
                   )
                    }

                 </div>

            <div className="config-field">
              <label>Target Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <optgroup label="💻 Technology">
                  <option>Software Engineer</option>
                  <option>Backend Developer</option>
                  <option>Frontend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>Python Developer</option>
                  <option>Java Developer</option>
                  <option>Cyber Security Analyst</option>
                  <option>Cloud Engineer</option>
                  <option>DevOps Engineer</option>
                  <option>Data Analyst</option>
                  <option>Data Scientist</option>
                  <option>AI / ML Engineer</option>
                  <option>QA Engineer</option>
                </optgroup>
                <optgroup label="🏦 Banking & Finance">
                  <option>Bank Probationary Officer (PO)</option>
                  <option>Bank Clerk</option>
                  <option>Relationship Manager</option>
                  <option>Investment Banker</option>
                  <option>Financial Analyst</option>
                  <option>Credit Analyst</option>
                  <option>Risk Analyst</option>
                  <option>Chartered Accountant</option>
                </optgroup>
                <optgroup label="💊 Pharma & Healthcare">
                  <option>Quality Assurance (QA)</option>
                  <option>Quality Control (QC)</option>
                  <option>QC Analyst</option>
                  <option>QA Officer</option>
                  <option>Production Officer (Pharma)</option>
                  <option>Manufacturing Executive</option>
                  <option>Clinical Research Associate</option>
                  <option>Medical Representative</option>
                  <option>Regulatory Affairs Executive</option>
                  <option>Pharmacovigilance Associate</option>
                  <option>Hospital Pharmacist</option>
                  <option>Staff Nurse</option>
                  <option>Laboratory Technician</option>
                  <option>Microbiologist</option>
                  <option>Hospital Administrator</option>
                </optgroup>
                <optgroup label="📊 Management">
                  <option>Business Analyst</option>
                  <option>Project Manager</option>
                  <option>Product Manager</option>
                  <option>Operations Manager</option>
                  <option>HR Executive</option>
                  <option>Marketing Executive</option>
                  <option>Sales Manager</option>
                </optgroup>
                <optgroup label="⚙ Engineering">
                  <option>Mechanical Engineer</option>
                  <option>Electrical Engineer</option>
                  <option>Civil Engineer</option>
                  <option>Automobile Engineer</option>
                </optgroup>
                <optgroup label="🏛 Government">
                  <option>UPSC Interview</option>
                  <option>SSC Interview</option>
                  <option>Railway Officer</option>
                  <option>Police Officer</option>
                  <option>Government Clerk</option>
                </optgroup>
                <optgroup label="🎓 Education">
                  <option>Teacher</option>
                  <option>Lecturer</option>
                  <option>Professor</option>
                </optgroup>
                <optgroup label="☎ Customer Service">
                  <option>Customer Support Executive</option>
                  <option>BPO Associate</option>
                  <option>Call Center Executive</option>
                </optgroup>
                <optgroup label="🏨 Hospitality">
                  <option>Hotel Manager</option>
                  <option>Receptionist</option>
                  <option>Restaurant Manager</option>
                  <option>Cabin Crew</option>
                </optgroup>
              </select>
            </div>

            <div className="config-field">
              <label>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>HR Round</option>
                <option>Technical Round</option>
                <option>Managerial Round</option>
              </select>
            </div>

          </div>

          {error && (
            <div style={{
              padding: "12px 16px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "8px",
              color: "#f87171",
              fontSize: "14px",
              marginBottom: "16px"
            }}>
              {error}
            </div>
          )}

          <button className="btn-generate" onClick={handleGenerate} disabled={loading}>
            {loading ? (
              <>
                <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                Generating questions…
              </>
            ) : "🚀 Generate Interview Questions"}
          </button>
        </div>

        {/* Live session summary — appears once at least 1 answer evaluated */}
        {answeredCount > 0 && (
          <div className="session-summary">
            <div className="session-summary-stat">
              <span className="val indigo">{answeredCount}/{questions.length}</span>
              <span className="lbl">Answered</span>
            </div>
            <div className="session-summary-divider" />
            <div className="session-summary-stat">
              <span className={`val ${avgScore >= 7 ? "green" : avgScore >= 4 ? "amber" : ""}`}>
                {avgScore}/10
              </span>
              <span className="lbl">Avg Score</span>
            </div>
            <div className="session-summary-divider" />
            <div className="session-summary-stat">
              <span className="val green">{bestScore}/10</span>
              <span className="lbl">Best Score</span>
            </div>
          </div>
        )}

        {/* Questions + answer inputs */}
        {questions.length > 0 && (
          <div ref={questionsRef}>
            <div className="questions-header">
              <h2>Your Questions</h2>
              <span className="questions-count">{questions.length} questions</span>
            </div>

            {questions.map((question, index) => {
              const evaluated  = !!evaluations[index];
              const isLoading  = !!evalLoading[index];
              const answer     = answers[index] || "";
              const result     = evaluations[index];
              const charCount  = answer.length;

              return (
                <div
                  className={`question-card ${evaluated ? "answered" : ""} ${!evaluated && answer ? "active" : ""}`}
                  key={index}
                >
                  {/* Number badge */}
                  <div className={`question-num ${evaluated ? "done" : ""}`}>
                    {evaluated ? "✓" : index + 1}
                  </div>

                  <div className="question-body">
                    {/* Question text */}
                    <p className="question-text">{question}</p>

                    {/* Answer textarea — hide once evaluated */}
                    {!evaluated && (
                      <>
                        <textarea
                          className="answer-textarea"
                          placeholder="Type your answer here…"
                          value={answer}
                          disabled={isLoading}
                          onChange={(e) =>
                            setAnswers((prev) => ({ ...prev, [index]: e.target.value }))
                          }
                        />
                        <div className="answer-actions">
                          <button
                            className="btn-submit-answer"
                            onClick={() => handleEvaluate(index)}
                            disabled={isLoading || !answer.trim()}
                          >
                            {isLoading ? (
                              <>
                                <span className="btn-mini-spinner" />
                                Evaluating…
                              </>
                            ) : "Evaluate Answer →"}
                          </button>
                          <span className="answer-char-count">{charCount} chars</span>
                        </div>
                      </>
                    )}

                    {/* Evaluation result */}
                    {evaluated && result && <EvalPanel result={result} />}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default Interview;