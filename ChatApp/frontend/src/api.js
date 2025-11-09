import axios from 'axios';
import { getAccessToken, getRefreshToken, saveTokens } from './tokenUtils';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/',
});

api.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const response = await axios.post(
          'http://127.0.0.1:8000/auth/token/refresh/',
          {
            refresh: JSON.parse(getRefreshToken()),
          }
        );

        const newAccessToken = response.data.access;
        const newRefreshToken = response.data.refresh;

        saveTokens(newAccessToken, newRefreshToken);

        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return axios(originalRequest);
      } catch (e) {
        console.error('Token refresh failed', e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
