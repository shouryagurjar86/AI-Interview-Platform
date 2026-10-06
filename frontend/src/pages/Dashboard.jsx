import {
  useEffect,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  getDashboardStats,
  getMe
} from "../services/api";


function Dashboard() {

  const navigate = useNavigate();

  const userId =
    localStorage.getItem("userId");


  const [stats, setStats] =
    useState(null);

  const [user, setUser] =
    useState(null);


  useEffect(() => {

    if (!userId) {

      navigate("/");

      return;
    }


    getDashboardStats(
      userId
    )
      .then((res) =>
        setStats(res.data)
      )
      .catch((err) =>
        console.error(err)
      );


    getMe(userId)
      .then((res) => {

        setUser(res.data);

        localStorage.setItem(
          "userName",
          res.data.name
        );

      })
      .catch((err) =>
        console.error(err)
      );

  }, [userId, navigate]);


  const logout = () => {

    localStorage.removeItem(
      "userId"
    );

    localStorage.removeItem(
      "userName"
    );

    localStorage.removeItem(
      "userEmail"
    );

    navigate("/");
  };


  const name =
    user?.name ||
    localStorage.getItem("userName") ||
    "User";


  const initial =
    name.charAt(0).toUpperCase();


  return (

    <div className="dashboard-page">

      <nav className="topnav">

        <div className="topnav-logo">

          <div className="topnav-logo-icon">
            🎯
          </div>

          <span>
            InterviewAI
          </span>

        </div>


        <div className="topnav-right">

          <div className="topnav-user">

            <div className="topnav-avatar">
              {initial}
            </div>

            <span>
              {name}
            </span>

          </div>


          <button
            onClick={logout}
            style={{
              background: "transparent",
              border: "1px solid var(--border-md)",
              borderRadius: "8px",
              padding: "7px 14px",
              color: "var(--text-secondary)",
              cursor: "pointer"
            }}
          >
            Logout
          </button>

        </div>

      </nav>


      <div className="dashboard-hero">

        <div className="dashboard-hero-eyebrow">
          <span>●</span>
          AI-Powered Interview Platform
        </div>


        <h1>
          Ready to{" "}
          <span>ace your</span>
          <br />
          next interview?
        </h1>


        <p>
          Upload your resume, get personalized questions, and receive instant AI feedback — all in one place.
        </p>

      </div>


      <div
        className="stats-strip"
        style={{
          padding: "0 40px",
          maxWidth: "1200px",
          margin: "0 auto 32px"
        }}
      >

        <div
          style={{
            display: "flex",
            gap: "1px",
            background: "var(--border)",
            border: "1px solid var(--border-md)",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            width: "100%"
          }}
        >

          <div className="stat-item">

            <span className="stat-value">
              {stats
                ? stats.total_questions
                : "—"}
            </span>

            <span className="stat-label">
              Questions Answered
            </span>

          </div>


          <div className="stat-item highlight">

            <span className="stat-value">
              {stats
                ? `${stats.average_score}/10`
                : "—"}
            </span>

            <span className="stat-label">
              Average Score
            </span>

          </div>


          <div className="stat-item">

            <span className="stat-value">
              {stats
                ? `${stats.highest_score}/10`
                : "—"}
            </span>

            <span className="stat-label">
              Best Score
            </span>

          </div>

        </div>

      </div>


      <div className="dashboard-grid">

        <div className="dash-card">

          <div className="dash-card-icon blue">
            📄
          </div>

          <h2>
            Resume Analysis
          </h2>

          <p>
            Upload your resume and receive AI-powered feedback — skills extracted, strengths highlighted, weaknesses flagged, and job matches surfaced.
          </p>

          <button
            className="dash-card-btn"
            onClick={() =>
              navigate("/upload")
            }
          >
            Analyze Resume →
          </button>

        </div>


        <div className="dash-card">

          <div className="dash-card-icon cyan">
            🎤
          </div>

          <h2>
            Interview Practice
          </h2>

          <p>
            Generate 10 tailored questions based on your resume and target role. Choose difficulty, answer at your own pace, and get scored.
          </p>

          <button
            className="dash-card-btn"
            onClick={() =>
              navigate("/interview")
            }
          >
            Start Interview →
          </button>

        </div>


        <div className="dash-card">

          <div className="dash-card-icon green">
            📊
          </div>

          <h2>
            Performance History
          </h2>

          <p>
            Review your previous answers, scores, AI feedback, and track your interview performance over time.
          </p>

          <button
            className="dash-card-btn"
            onClick={() =>
              navigate("/history")
            }
          >
            View History →
          </button>

        </div>

      </div>


      <div className="tip-bar">

        <div className="tip-bar-inner">

          <span className="tip-bar-icon">
            💡
          </span>

          <p>
            <strong>
              Pro tip:
            </strong>{" "}
            Upload your actual resume before starting an interview — the AI uses it to generate questions specific to your projects, skills, and experience.
          </p>

        </div>

      </div>

    </div>

  );
}


export default Dashboard;