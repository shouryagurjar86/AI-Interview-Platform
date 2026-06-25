import axios from "axios";

const api = axios.create({
  baseURL: " https://beata-nontheoretic-weldon.ngrok-free.dev",
});

export const loginUser = (data) => {
  return api.post("/login", data);
};

export default api;

export const uploadResume = (formData) => {
  return api.post("/upload-resume", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const analyzeResume = () => {
  return api.post("/analyze-resume");
};

export const generateQuestions = (data) => {
    return api.post("/generate-questions", data);
};

export const getResumes = () => {
    return api.get("/resumes");
};