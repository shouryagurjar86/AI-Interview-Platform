import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/dashboard-stats")
      .then((res) => setStats(res.data))
      .catch(() => {});
  }, []);

  return (
    <div className="dashboard-page">

      {/* Top Nav */}
      <nav className="topnav">
        <div className="topnav-logo">
          <div className="topnav-logo-icon">🎯</div>
          <span>InterviewAI</span>
        </div>
        <div className="topnav-right">
          <div className="topnav-user">
            <div className="topnav-avatar">U</div>
            <span>My Account</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-eyebrow">
          <span>●</span> AI-Powered Interview Platform
        </div>
        <h1>
          Ready to <span>ace your</span><br />next interview?
        </h1>
        <p>
          Upload your resume, get personalized questions, and receive instant AI feedback — all in one place.
        </p>
      </div>

      {/* Stats Strip */}
      <div className="stats-strip" style={{ padding: "0 40px", maxWidth: "1200px", margin: "0 auto 32px" }}>
        <div style={{
          display: "flex",
          gap: "1px",
          background: "var(--border)",
          border: "1px solid var(--border-md)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          width: "100%"
        }}>
          {[
            {
              value: stats ? stats.total_questions : "—",
              label: "Questions Answered",
              highlight: false,
            },
            {
              value: stats ? `${stats.average_score}%` : "—",
              label: "Average Score",
              highlight: true,
            },
            {
              value: stats ? `${stats.highest_score}%` : "—",
              label: "Best Score",
              highlight: false,
            },
          ].map((s, i) => (
            <div className={`stat-item${s.highlight ? " highlight" : ""}`} key={i}>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div className="dashboard-grid">

        <div className="dash-card">
          <div className="dash-card-icon blue">📄</div>
          <h2>Resume Analysis</h2>
          <p>
            Upload your resume and receive AI-powered feedback — skills extracted, strengths highlighted, weaknesses flagged, and job matches surfaced.
          </p>
          <button className="dash-card-btn" onClick={() => navigate("/upload")}>
            Analyze Resume →
          </button>
        </div>

        <div className="dash-card">
          <div className="dash-card-icon cyan">🎤</div>
          <h2>Interview Practice</h2>
          <p>
            Generate 10 tailored questions based on your resume and target role. Choose difficulty, answer at your own pace, get scored.
          </p>
          <button className="dash-card-btn" onClick={() => navigate("/interview")}>
            Start Interview →
          </button>
        </div>

        <div className="dash-card disabled">
          <div className="dash-card-icon green">📊</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2>Performance History</h2>
            <span className="dash-card-badge badge-soon">Soon</span>
          </div>
          <p>
            Track scores over time, review past answers, and measure improvement session by session.
          </p>
          <button className="dash-card-btn" disabled>Coming Soon</button>
        </div>

      </div>

      {/* Tip bar */}
      <div className="tip-bar">
        <div className="tip-bar-inner">
          <span className="tip-bar-icon">💡</span>
          <p>
            <strong>Pro tip:</strong> Upload your actual resume before starting an interview — the AI uses it to generate questions specific to your projects, skills, and experience.
          </p>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;