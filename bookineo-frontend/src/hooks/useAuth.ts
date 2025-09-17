import { useState, useEffect, createContext, useContext } from "react";
import { toast } from "react-toastify";
import { authAPI, type User, type LoginData, type RegisterData } from "../api/auth";

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};

export const useAuthState = () => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("authToken");
            if (token) {
                try {
                    const userData = await authAPI.getProfile();
                    setUser(userData);
                } catch {
                    localStorage.removeItem("authToken");
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (data: LoginData) => {
        try {
            const { token } = await authAPI.login(data);
            localStorage.setItem("authToken", token);
            const userData = await authAPI.getProfile();
            setUser(userData);
            toast.success("Connexion réussie !");
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur de connexion");
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const { user: newUser } = await authAPI.register(data);
            const loginData = { email: data.email, password: data.password };
            toast.success("Inscription réussie ! Connexion en cours...");
            await login(loginData);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Erreur lors de l'inscription");
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("authToken");
        setUser(null);
        toast.info("Déconnexion réussie !");
    };

    const refreshUser = async () => {
        if (localStorage.getItem("authToken")) {
            try {
                const userData = await authAPI.getProfile();
                setUser(userData);
            } catch (error) {
                toast.error("Session expirée, veuillez vous reconnecter");
                logout();
            }
        }
    };

    return {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
    };
};

export { AuthContext };
