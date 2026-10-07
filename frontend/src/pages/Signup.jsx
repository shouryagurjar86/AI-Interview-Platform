import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../services/api";


function Signup() {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();


  const handleSignup = async () => {

    // -----------------------------------------
    // VALIDATION
    // -----------------------------------------

    if (
      !name.trim() ||
      !email.trim() ||
      !password
    ) {

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


    // -----------------------------------------
    // RESET ERROR
    // -----------------------------------------

    setError("");
    setLoading(true);


    try {

      // ---------------------------------------
      // SEND REQUEST
      // ---------------------------------------

      const response = await signupUser({

        name: name.trim(),

        email: email.trim(),

        password: password,

      });


      console.log(
        "SIGNUP RESPONSE:",
        response.data
      );


      // ---------------------------------------
      // BACKEND ERROR
      // ---------------------------------------

      if (response.data.error) {

        setError(
          response.data.error
        );

        return;
      }


      // ---------------------------------------
      // CHECK USER ID
      // ---------------------------------------

      if (!response.data.user_id) {

        setError(
          "Account created, but user information was not returned."
        );

        return;
      }


      // ---------------------------------------
      // SAVE USER INFORMATION
      // ---------------------------------------

      localStorage.setItem(
        "userId",
        String(response.data.user_id)
      );

      localStorage.setItem(
        "userName",
        response.data.name || name.trim()
      );

      localStorage.setItem(
        "userEmail",
        response.data.email || email.trim()
      );


      // ---------------------------------------
      // SUCCESS
      // ---------------------------------------

      navigate("/dashboard");

    } catch (err) {

      console.error(
        "SIGNUP ERROR:",
        err
      );


      // ---------------------------------------
      // SERVER RESPONSE ERROR
      // ---------------------------------------

      if (err.response) {

        console.error(
          "STATUS:",
          err.response.status
        );

        console.error(
          "DATA:",
          err.response.data
        );


        if (
          err.response.data?.detail
        ) {

          setError(
            err.response.data.detail
          );

        } else if (
          err.response.data?.error
        ) {

          setError(
            err.response.data.error
          );

        } else {

          setError(
            `Signup failed (${err.response.status}).`
          );

        }

      }

      // ---------------------------------------
      // REQUEST WAS SENT BUT NO RESPONSE
      // ---------------------------------------

      else if (err.request) {

        setError(
          "Unable to reach the server. Please try again."
        );

      }

      // ---------------------------------------
      // OTHER ERROR
      // ---------------------------------------

      else {

        setError(
          "Signup failed. Please try again."
        );

      }

    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="auth-page">

      <div className="auth-wrapper">


        {/* =====================================
            LEFT BRAND PANEL
        ====================================== */}

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
              Join thousands of candidates who
              practice smarter with AI-generated
              questions tailored to their resume
              and role.
            </p>

          </div>


          <div className="auth-brand-features">

            {[
              "Free to get started — no credit card needed",
              "AI feedback on every single answer",
              "Track progress with performance history",
            ].map(
              (feature, index) => (

                <div
                  className="brand-feature"
                  key={index}
                >

                  <div className="brand-feature-dot" />

                  <span>
                    {feature}
                  </span>

                </div>

              )
            )}

          </div>

        </div>


        {/* =====================================
            RIGHT FORM PANEL
        ====================================== */}

        <div className="auth-form-panel">

          <h1>
            Create account
          </h1>


          <p className="auth-subtitle">
            Start preparing for your next
            interview today
          </p>


          {/* =================================
              ERROR MESSAGE
          ================================== */}

          {error && (

            <div
              style={{
                padding: "12px 16px",
                background:
                  "rgba(239,68,68,0.1)",
                border:
                  "1px solid rgba(239,68,68,0.25)",
                borderRadius: "8px",
                color: "#f87171",
                fontSize: "14px",
                marginBottom: "16px",
              }}
            >

              {error}

            </div>

          )}


          {/* =================================
              NAME
          ================================== */}

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
              disabled={loading}
            />

          </div>


          {/* =================================
              EMAIL
          ================================== */}

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
              disabled={loading}
            />

          </div>


          {/* =================================
              PASSWORD
          ================================== */}

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
              disabled={loading}
            />

          </div>


          {/* =================================
              SIGNUP BUTTON
          ================================== */}

          <button
            className="btn-primary"
            onClick={handleSignup}
            disabled={loading}
          >

            {loading
              ? "Creating account…"
              : "Create account →"}

          </button>


          {/* =================================
              LOGIN LINK
          ================================== */}

          <p className="auth-footer-text">

            Already have an account?

            {" "}

            <a href="/">
              Sign in
            </a>

          </p>

        </div>

      </div>

    </div>

  );
}


export default Signup;