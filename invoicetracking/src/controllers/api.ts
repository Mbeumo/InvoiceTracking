import axios from 'axios';


const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9999/api';


export const api = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,  // Try without credentials first
    timeout: 10000,  // 10 second timeout
    headers: {
        'Content-Type': 'application/json',
    }
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    // Common Django SimpleJWT refresh endpoint
                    const { data } = await axios.post(
                        `${apiBaseUrl}/auth/token/refresh`,
                        { refresh: refreshToken },
                        { withCredentials: true }
                    );
                    const newAccess = data.access || data.token;
                    if (newAccess) {
                        localStorage.setItem('authToken', newAccess);
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                        return api(originalRequest);
                    }
                } catch (_) {
                    // fall through to reject
                }
            }
            // If refresh fails, clear tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
        }
        return Promise.reject(error);
    }
);

export default api;


