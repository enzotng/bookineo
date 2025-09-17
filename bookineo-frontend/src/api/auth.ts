const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    birthDate?: string;
}

export interface LoginData {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface AuthResponse {
    token: string;
}

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    birth_date?: string;
}

export const authAPI = {
    register: async (data: RegisterData): Promise<{ user: User }> => {
        const response = await fetch(`${API_BASE_URL}/api/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: data.email,
                password: data.password,
                first_name: data.firstName,
                last_name: data.lastName,
                birth_date: data.birthDate || null,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Erreur lors de l'inscription");
        }

        return response.json();
    },

    login: async (data: LoginData): Promise<AuthResponse> => {
        const response = await fetch(`${API_BASE_URL}/api/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: data.email,
                password: data.password,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Erreur lors de la connexion");
        }

        return response.json();
    },

    getProfile: async (): Promise<User> => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            throw new Error("Token manquant");
        }

        const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401) {
                localStorage.removeItem("authToken");
                throw new Error("Session expirée");
            }
            const error = await response.json();
            throw new Error(error.error || "Erreur lors de la récupération du profil");
        }

        return response.json();
    },
};
