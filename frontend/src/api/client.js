import axios from "axios";

const BASE_URL = "https://skillstream-q2ni.onrender.com/api/v1";

export function createApiClient(getToken) {
  const instance = axios.create({
    baseURL: BASE_URL,
  });

  instance.interceptors.request.use((config) => {
    const token = getToken?.();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  return instance;
}