import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  loginUser
} from "../services/api";


function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();


  const handleLogin = async (e) => {

    e.preventDefault();


    if (!email || !password) {

      setError(
        "Please fill in both fields."
      );

      return;
    }


    setError("");
    setLoading(true);


    try {

      const response = await loginUser({

        email: email.trim(),

        password

      });


      localStorage.setItem(
        "userId",
        String(response.data.user_id)
      );

      localStorage.setItem(
        "userName",
        response.data.name
      );

      localStorage.setItem(
        "userEmail",
        response.data.email
      );


      navigate(
        "/dashboard"
      );


    } catch (err) {

      const message =
        err.response?.data?.detail ||
        "Unable to connect. Please try again.";

      setError(message);


    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="auth-page">

      <div className="auth-wrapper">

        <div className="auth-brand">

          <div className="auth-brand-content">

            <div className="brand-logo">

              <div className="brand-logo-icon">
                🎯
              </div>

              <span>
                InterviewAI
              </span>

            </div>


            <h2>
              Prepare like a pro.
              <br />
              Land your dream job.
            </h2>


            <p>
              AI-powered mock interviews, resume analysis, and real-time feedback — built for serious candidates.
            </p>

          </div>


          <div className="auth-brand-features">

            {[
              "Personalized interview questions from your resume",
              "Instant AI scoring and detailed feedback",
              "Covers 50+ roles across all industries"
            ].map((feature, index) => (

              <div
                className="brand-feature"
                key={index}
              >

                <div className="brand-feature-dot" />

                <span>
                  {feature}
                </span>

              </div>

            ))}

          </div>

        </div>


        <div className="auth-form-panel">

          <h1>
            Welcome back
          </h1>

          <p className="auth-subtitle">
            Sign in to continue your interview prep
          </p>


          {error && (

            <div
              style={{
                padding: "12px 16px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "8px",
                color: "#f87171",
                fontSize: "14px",
                marginBottom: "16px"
              }}
            >
              {error}
            </div>

          )}


          <form onSubmit={handleLogin}>

            <div className="form-group">

              <label>
                Email address
              </label>

              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label>
                Password
              </label>

              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

            </div>


            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading
                ? "Signing in…"
                : "Sign in →"}
            </button>

          </form>


          <p className="auth-footer-text">

            New here?{" "}

            <Link to="/signup">
              Create a free account
            </Link>

          </p>

        </div>

      </div>

    </div>

  );
}


export default Login;