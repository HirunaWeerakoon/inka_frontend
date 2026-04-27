import axios from 'axios';

const TOKEN_KEY = 'auth_token';

export const authService = {
    setToken(token) {
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    removeToken() {
        localStorage.removeItem(TOKEN_KEY);
    },

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        try {
            // Simple check if token is expired (assuming JWT contains 'exp' claim)
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch (e) {
            return false;
        }
    },

    getUserDetails() {
        const token = this.getToken();
        if (!token) return null;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return {
                id: payload.sub,
                email: payload.email,
                role: payload.role
            };
        } catch (e) {
            return null;
        }
    },

    setupAxiosInterceptors() {
        axios.interceptors.request.use(
            (config) => {
                const token = this.getToken();
                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    this.removeToken();
                    // Optional: trigger redirect to home/login
                    window.location.href = '/';
                }
                return Promise.reject(error);
            }
        );
    }
};
