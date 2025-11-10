import axios from 'axios';

// Use /api for Vite proxy, or direct URL if VITE_API_URL is set
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.data);
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error('[API Error]', {
      message: error.message,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
      response: error.response?.data,
      request: error.request,
    });
    
    if (error.response) {
      // Server responded with error
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({ 
        error: 'Network error', 
        message: 'No response from server. Make sure the backend server is running on port 3001.' 
      });
    } else {
      // Something else happened
      return Promise.reject({ error: 'Request error', message: error.message });
    }
  }
);

