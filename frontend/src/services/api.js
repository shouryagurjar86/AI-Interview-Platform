import axios from "axios";

const api = axios.create({
  baseURL: "https://beata-nontheoretic-weldon.ngrok-free.dev",
  timeout: 120000,
});

// Signup
export const signupUser = (data) => {
  return api.post("/signup", data);
};

// Login
export const loginUser = (data) => {
  return api.post("/login", data);
};

// Get user
export const getMe = (userId) => {
  return api.get(`/me/${userId}`);
};


 

export const uploadResume = (
  formData
) => {

  return api.post(
    "/upload-resume",
    formData
  );
};


export const analyzeResume = (
  userId
) => {

  return api.post(
    "/analyze-resume",
    null,
    {
      params: {
        user_id: userId
      }
    }
  );
};


export const generateQuestions = (
  formData
) => {

  return api.post(
    "/generate-questions",
    formData
  );
};


export const evaluateAnswer = (
  data
) => {

  return api.post(
    "/evaluate-answer",
    data
  );
};


export const getInterviewHistory = (
  userId
) => {

  return api.get(
    "/interview-history",
    {
      params: {
        user_id: userId
      }
    }
  );
};


export const deleteInterviewResult = (
  resultId,
  userId
) => {

  return api.delete(
    `/interview-history/${resultId}`,
    {
      params: {
        user_id: userId
      }
    }
  );
};


export const getDashboardStats = (
  userId
) => {

  return api.get(
    "/dashboard-stats",
    {
      params: {
        user_id: userId
      }
    }
  );
};


export const getResumes = (
  userId
) => {

  return api.get(
    "/resumes",
    {
      params: {
        user_id: userId
      }
    }
  );
};


export default api;