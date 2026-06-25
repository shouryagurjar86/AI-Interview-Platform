import { useState } from "react";
import { loginUser } from "../services/api";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in both fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const response = await loginUser({ email, password });
      if (response.data.error) {
        setError(response.data.error);
      } else {
        navigate("/dashboard");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="auth-page">
      <div className="auth-wrapper">

        {/* Left — Brand panel */}
        <div className="auth-brand">
          <div className="auth-brand-content">
            <div className="brand-logo">
              <div className="brand-logo-icon">🎯</div>
              <span>InterviewAI</span>
            </div>
            <h2>Prepare like a pro.<br />Land your dream job.</h2>
            <p>
              AI-powered mock interviews, resume analysis, and real-time feedback — built for serious candidates.
            </p>
          </div>
          <div className="auth-brand-features">
            {[
              "Personalized interview questions from your resume",
              "Instant AI scoring and detailed feedback",
              "Covers 50+ roles across all industries",
            ].map((f, i) => (
              <div className="brand-feature" key={i}>
                <div className="brand-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form panel */}
        <div className="auth-form-panel">
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue your interview prep</p>

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

          <div className="form-group">
            <label>Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>

          <button
            className="btn-primary"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>

          <p className="auth-footer-text">
            New here? <a href="/signup">Create a free account</a>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Login;