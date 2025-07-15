import axios from "axios";
const baseUrl = "http://localhost:8000";

const apiProduction = axios.create({
  baseURL: baseUrl,
});

apiProduction.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiProduction.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle token expiry or other 401 errors here
      // Maybe you want to log the user out automatically
    }
    return Promise.reject(error);
  }
);

export { baseUrl, apiProduction };