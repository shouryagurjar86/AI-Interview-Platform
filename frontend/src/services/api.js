import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 120000,
});


// =========================================================
// SIGNUP
// =========================================================

export const signupUser = (data) => {
  return api.post("/signup", data);
};


// =========================================================
// LOGIN
// =========================================================

export const loginUser = (data) => {
  return api.post("/login", data);
};


// =========================================================
// RESUME UPLOAD
// =========================================================

export const uploadResume = (formData) => {
  return api.post(
    "/upload-resume",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


// =========================================================
// RESUME ANALYSIS
// =========================================================

export const analyzeResume = () => {
  return api.post("/analyze-resume");
};


// =========================================================
// GENERATE QUESTIONS
// =========================================================

export const generateQuestions = (formData) => {
  return api.post(
    "/generate-questions",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};


// =========================================================
// GET RESUMES
// =========================================================

export const getResumes = () => {
  return api.get("/resumes");
};


// =========================================================
// GET INTERVIEW HISTORY
// =========================================================

export const getInterviewHistory = () => {
  return api.get("/interview-history");
};


// =========================================================
// GET DASHBOARD STATS
// =========================================================

export const getDashboardStats = () => {
  return api.get("/dashboard-stats");
};


// =========================================================
// DEFAULT AXIOS INSTANCE
// =========================================================

export default api;