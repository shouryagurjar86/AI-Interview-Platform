import {
  useEffect,
  useMemo,
  useState
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  getInterviewHistory,
  deleteInterviewResult
} from "../services/api";


function PerformanceHistory() {

  const navigate =
    useNavigate();


  const userId =
    localStorage.getItem("userId");


  const [history, setHistory] =
    useState([]);

  const [filter, setFilter] =
    useState("all");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadHistory = async () => {

    if (!userId) {

      navigate("/");

      return;
    }


    try {

      setLoading(true);

      const response =
        await getInterviewHistory(
          userId
        );

      setHistory(
        response.data
      );


    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.detail ||
        "Unable to load interview history."
      );


    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadHistory();

  }, []);


  const filteredHistory =
    useMemo(() => {

      if (filter === "high") {

        return history.filter(
          (item) =>
            item.score >= 7
        );
      }


      if (filter === "medium") {

        return history.filter(
          (item) =>
            item.score >= 4 &&
            item.score < 7
        );
      }


      if (filter === "low") {

        return history.filter(
          (item) =>
            item.score < 4
        );
      }


      return history;

    }, [history, filter]);


  const handleDelete = async (
    id
  ) => {

    const confirmed =
      window.confirm(
        "Delete this interview result?"
      );


    if (!confirmed) {
      return;
    }


    try {

      await deleteInterviewResult(
        id,
        userId
      );


      setHistory(
        (prev) =>
          prev.filter(
            (item) =>
              item.id !== id
          )
      );


    } catch (err) {

      console.error(err);

      alert(
        "Could not delete this result."
      );

    }
  };


  const scoreClass = (score) => {

    if (score >= 7)
      return "score-high";

    if (score >= 4)
      return "score-mid";

    return "score-low";
  };


  return (

    <div className="interview-page">

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
              cursor: "pointer"
            }}
          >
            ← Dashboard
          </button>

        </div>

      </nav>


      <div className="interview-layout">

        <div className="page-header">

          <div className="page-header-eyebrow">
            Performance
          </div>

          <h1>
            Interview History
          </h1>

          <p>
            Review your previous answers, scores, and AI feedback.
          </p>

        </div>


        <div
          className="config-panel"
          style={{
            marginBottom: "24px"
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap"
            }}
          >

            <div>

              <h2
                style={{
                  marginBottom: "4px"
                }}
              >
                Your Results
              </h2>

              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "14px"
                }}
              >
                {history.length} answer
                {history.length !== 1
                  ? "s"
                  : ""} evaluated
              </p>

            </div>


            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value
                )
              }
              style={{
                padding: "10px 14px",
                background: "var(--surface-2)",
                border: "1px solid var(--border-md)",
                borderRadius: "8px",
                color: "var(--text-primary)"
              }}
            >

              <option value="all">
                All Scores
              </option>

              <option value="high">
                Strong (7–10)
              </option>

              <option value="medium">
                Average (4–6)
              </option>

              <option value="low">
                Needs Improvement (0–3)
              </option>

            </select>

          </div>

        </div>


        {loading && (

          <div className="spinner-wrapper">

            <div className="spinner" />

            <p>
              Loading your history…
            </p>

          </div>

        )}


        {error && (

          <div
            style={{
              padding: "14px 16px",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.25)",
              borderRadius: "8px",
              color: "#f87171",
              marginBottom: "20px"
            }}
          >
            {error}
          </div>

        )}


        {!loading &&
          filteredHistory.length === 0 && (

            <div className="config-panel">

              <h2>
                No results yet
              </h2>

              <p
                style={{
                  color: "var(--text-secondary)",
                  marginTop: "8px"
                }}
              >
                Complete an interview and evaluate your answers to see your performance here.
              </p>

              <button
                className="btn-generate"
                style={{
                  marginTop: "20px"
                }}
                onClick={() =>
                  navigate("/interview")
                }
              >
                Start Interview →
              </button>

            </div>

          )}


        {!loading &&
          filteredHistory.map(
            (item) => (

              <div
                className="question-card"
                key={item.id}
                style={{
                  position: "relative"
                }}
              >

                <div
                  className={`question-num ${scoreClass(item.score)}`}
                >
                  {item.score}
                </div>


                <div className="question-body">

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "16px",
                      alignItems: "flex-start"
                    }}
                  >

                    <p className="question-text">
                      {item.question}
                    </p>


                    <button
                      onClick={() =>
                        handleDelete(
                          item.id
                        )
                      }
                      style={{
                        background: "transparent",
                        border: "1px solid rgba(239,68,68,0.25)",
                        color: "#f87171",
                        borderRadius: "7px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        flexShrink: 0
                      }}
                    >
                      Delete
                    </button>

                  </div>


                  <div
                    style={{
                      background: "var(--surface-2)",
                      borderRadius: "8px",
                      padding: "14px",
                      color: "var(--text-secondary)",
                      fontSize: "14px",
                      lineHeight: "1.6"
                    }}
                  >

                    <strong
                      style={{
                        color: "var(--text-primary)"
                      }}
                    >
                      Your answer:
                    </strong>

                    <br />

                    {item.answer}

                  </div>


                  {item.feedback && (

                    <div
                      className="eval-improved"
                      style={{
                        marginTop: "4px"
                      }}
                    >

                      <div className="eval-improved-title">
                        <span>✦</span>
                        Model feedback
                      </div>

                      <p className="eval-improved-text">
                        {item.feedback}
                      </p>

                    </div>

                  )}


                  <span
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "12px"
                    }}
                  >
                    {item.created_at
                      ? new Date(
                          item.created_at
                        ).toLocaleString()
                      : ""}
                  </span>

                </div>

              </div>

            )
          )}

      </div>

    </div>

  );
}


export default PerformanceHistory;