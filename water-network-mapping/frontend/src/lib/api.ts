import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Configure interceptor to attach bearer token to requests
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// We can add response interceptor later to handle 401 globally and attempt a token refresh
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // You can implement the global token refresh flow here
        return Promise.reject(error);
    }
);

export default api;
