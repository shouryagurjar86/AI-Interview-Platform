import axios from "axios";


// =========================================================
// AXIOS INSTANCE
// =========================================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 120000,
});


// =========================================================
// AUTH
// =========================================================

export const signupUser = (data) => {
  return api.post("/signup", data);
};


export const loginUser = (data) => {
  return api.post("/login", data);
};


export const getMe = (userId) => {
  return api.get(`/me/${userId}`);
};


// =========================================================
// RESUME
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


export const analyzeResume = () => {
  return api.post("/analyze-resume");
};


export const getResumes = () => {
  return api.get("/resumes");
};


// =========================================================
// INTERVIEW
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


export const evaluateAnswer = (data) => {
  return api.post(
    "/evaluate-answer",
    data
  );
};


// =========================================================
// DASHBOARD
// =========================================================

export const getDashboardStats = () => {
  return api.get("/dashboard-stats");
};


export const getInterviewHistory = () => {
  return api.get("/interview-history");
};


// =========================================================
// PERFORMANCE HISTORY
// =========================================================

export const deleteInterviewResult = (id) => {
  return api.delete(
    `/interview-history/${id}`
  );
};


// =========================================================
// DEFAULT EXPORT
// =========================================================

export default api;