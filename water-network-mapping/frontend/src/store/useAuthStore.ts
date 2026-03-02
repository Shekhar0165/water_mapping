import { create } from 'zustand';
import api from '../lib/api';
import { jwtDecode } from 'jwt-decode';

interface User {
    userId: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,

    initialize: () => {
        const token = localStorage.getItem('access_token');
        if (token) {
            try {
                const decoded: any = jwtDecode(token);
                // Basic check to see if token is expired
                const isExpired = decoded.exp * 1000 < Date.now();

                if (!isExpired) {
                    set({
                        token,
                        user: { userId: decoded.sub, email: decoded.email, role: decoded.role },
                        isAuthenticated: true,
                        isLoading: false
                    });
                    return;
                } else {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                }
            } catch (e) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        }
        set({ isLoading: false, isAuthenticated: false, user: null });
    },

    login: async (email, password) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { accessToken, refreshToken } = response.data;

            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);

            const decoded: any = jwtDecode(accessToken);
            set({
                token: accessToken,
                user: { userId: decoded.sub, email: decoded.email, role: decoded.role },
                isAuthenticated: true
            });
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    },

    logout: async () => {
        try {
            // Optional: call backend to invalidate refresh token
            await api.post('/auth/logout');
        } catch (e) {
            // Continue even if backend call fails
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            set({ user: null, token: null, isAuthenticated: false });
        }
    },
}));
