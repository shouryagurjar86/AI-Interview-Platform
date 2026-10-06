import {
  useState
} from "react";

import {
  uploadResume,
  analyzeResume
} from "../services/api";

import {
  useNavigate
} from "react-router-dom";


function ResumeUpload() {

  const userId =
    localStorage.getItem("userId");


  const [fileName, setFileName] =
    useState("");

  const [resume, setResume] =
    useState(null);

  const [analysis, setAnalysis] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const navigate =
    useNavigate();


  const handleFileChange = (e) => {

    const file =
      e.target.files[0];


    if (!file) {
      return;
    }


    if (
      file.type !== "application/pdf"
    ) {

      setError(
        "Please select a PDF file."
      );

      return;
    }


    if (
      file.size >
      10 * 1024 * 1024
    ) {

      setError(
        "File size must be below 10 MB."
      );

      return;
    }


    setResume(file);

    setFileName(
      file.name
    );

    setAnalysis(null);

    setError("");
  };


  const handleUpload = async () => {

    if (!userId) {

      navigate("/");

      return;
    }


    if (!resume) {

      setError(
        "Please select a PDF file first."
      );

      return;
    }


    setError("");
    setLoading(true);


    try {

      const formData =
        new FormData();


      formData.append(
        "user_id",
        userId
      );


      formData.append(
        "file",
        resume
      );


      await uploadResume(
        formData
      );


      const analysisResponse =
        await analyzeResume(
          userId
        );


      setAnalysis(
        analysisResponse.data.analysis
      );


    } catch (err) {

      console.error(err);


      setError(
        err.response?.data?.detail ||
        "Analysis failed. Check your backend and Gemini API."
      );


    } finally {

      setLoading(false);

    }
  };


  return (

    <div className="upload-page">

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

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            style={{
              background: "transparent",
              border: "1px solid var(--border-md)",
              borderRadius: "8px",
              padding: "7px 16px",
              color: "var(--text-secondary)",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            ← Dashboard
          </button>

        </div>

      </nav>


      <div className="upload-layout">

        <div className="page-header">

          <div className="page-header-eyebrow">
            Step 1
          </div>

          <h1>
            Resume Analysis
          </h1>

          <p>
            Upload your PDF resume and our AI will extract your skills, highlight strengths, surface improvement areas, and suggest matching roles.
          </p>

        </div>


        <div className="upload-zone">

          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
          />

          <div className="upload-zone-icon">
            📄
          </div>

          <h3>
            {fileName
              ? "File selected"
              : "Drop your resume here"}
          </h3>

          <p>
            {fileName
              ? ""
              : "PDF files only · Max 10 MB"}
          </p>


          {fileName && (

            <div className="file-selected">
              ✓ &nbsp;
              {fileName}
            </div>

          )}

        </div>


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


        <button
          className="btn-primary"
          onClick={handleUpload}
          disabled={
            loading ||
            !resume
          }
          style={{
            marginBottom: "8px"
          }}
        >

          {loading
            ? "Analyzing…"
            : "Analyze Resume →"}

        </button>


        {loading && (

          <div className="spinner-wrapper">

            <div className="spinner" />

            <p>
              AI is reading your resume…
            </p>

          </div>

        )}


        {analysis && (

          <div className="analysis-grid">

            <div className="analysis-card">

              <div className="analysis-card-header">

                <div className="analysis-card-icon blue">
                  🛠
                </div>

                <h2>
                  Skills Detected
                </h2>

              </div>


              <div>

                {(analysis.skills || []).map(
                  (skill, index) => (

                    <span
                      className="skill-tag"
                      key={index}
                    >
                      {skill}
                    </span>

                  )
                )}

              </div>

            </div>


            <div className="analysis-card">

              <div className="analysis-card-header">

                <div className="analysis-card-icon green">
                  💪
                </div>

                <h2>
                  Strengths
                </h2>

              </div>


              {(analysis.strengths || []).map(
                (item, index) => (

                  <div
                    className="analysis-item"
                    key={index}
                  >

                    <div className="analysis-item-dot dot-green" />

                    <span>
                      {item}
                    </span>

                  </div>

                )
              )}

            </div>


            <div className="analysis-card">

              <div className="analysis-card-header">

                <div className="analysis-card-icon amber">
                  ⚠
                </div>

                <h2>
                  Areas to Improve
                </h2>

              </div>


              {(analysis.weaknesses || []).map(
                (item, index) => (

                  <div
                    className="analysis-item"
                    key={index}
                  >

                    <div className="analysis-item-dot dot-amber" />

                    <span>
                      {item}
                    </span>

                  </div>

                )
              )}

            </div>


            <div className="analysis-card">

              <div className="analysis-card-header">

                <div className="analysis-card-icon cyan">
                  🎯
                </div>

                <h2>
                  Recommended Roles
                </h2>

              </div>


              {(analysis.recommended_roles || []).map(
                (role, index) => (

                  <div
                    className="analysis-item"
                    key={index}
                  >

                    <div className="analysis-item-dot dot-indigo" />

                    <span>
                      {role}
                    </span>

                  </div>

                )
              )}

            </div>

          </div>

        )}

      </div>

    </div>

  );
}


export default ResumeUpload;