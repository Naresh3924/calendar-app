import axios from "axios";
import { auth } from "../firebase";

const api = axios.create({
  baseURL: "https://calendarapi.amzeno.com",
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    if (status === 422) {
      console.error(
        "422 VALIDATION ERROR:",
        JSON.stringify(err.response.data, null, 2),
      );
    }
    // Don't log 409 as error — it's expected for existing users
    if (status !== 409) {
      // console.error(`API ${status}:`, err.config?.url);
    }
    return Promise.reject(err);
  },
);

export default api;
