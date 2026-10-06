import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../services/api";


function Signup() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();


  const handleSignup = async (e) => {

    e.preventDefault();

    if (!name.trim() || !email.trim() || !password) {

      setError(
        "Please fill in all fields."
      );

      return;
    }


    if (password.length < 6) {

      setError(
        "Password must be at least 6 characters."
      );

      return;
    }


    setError("");
    setLoading(true);


    try {

      const response = await signupUser({

        name: name.trim(),

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
        "Signup failed. Please try again.";

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
              Your interview
              <br />
              edge starts here.
            </h2>


            <p>
              Join thousands of candidates who practice smarter with AI-generated questions tailored to their resume and role.
            </p>

          </div>


          <div className="auth-brand-features">

            {[
              "Free to get started — no credit card needed",
              "AI feedback on every single answer",
              "Track progress with performance history"
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
            Create account
          </h1>

          <p className="auth-subtitle">
            Start preparing for your next interview today
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


          <form onSubmit={handleSignup}>

            <div className="form-group">

              <label>
                Full name
              </label>

              <input
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

            </div>


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
                placeholder="Min. 6 characters"
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
                ? "Creating account…"
                : "Create account →"}
            </button>

          </form>


          <p className="auth-footer-text">

            Already have an account?{" "}

            <Link to="/">
              Sign in
            </Link>

          </p>

        </div>

      </div>

    </div>

  );
}


export default Signup;