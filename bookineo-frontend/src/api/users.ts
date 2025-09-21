const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    birth_date?: string;
    created_at: string;
}

class UsersAPI {
    private getToken(): string | null {
        return localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    }

    async getAllUsers(): Promise<User[]> {
        try {
            const token = this.getToken();
            console.log("Token récupéré:", token ? "✓ Présent" : "✗ Manquant");

            if (!token) {
                throw new Error('Token d\'authentification manquant. Veuillez vous reconnecter.');
            }

            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem("authToken");
                    sessionStorage.removeItem("authToken");
                    throw new Error("Session expirée. Veuillez vous reconnecter.");
                }
                const errorData = await response.json().catch(() => ({ error: 'Erreur inconnue' }));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error("Users API error:", error);
            throw error;
        }
    }
}

export const usersAPI = new UsersAPI();