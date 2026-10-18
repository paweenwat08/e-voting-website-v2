import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode
} from "react";

import { getCurrentUser, userLogout } from "../services/authService";
import type { CurrentUser } from "../types/User";

interface AuthContextType {
    isLoggedIn: boolean;
    user: CurrentUser | null;
    isLoading: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (error) {
            console.error("Failed to check login session:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        void refreshUser();
    }, []);

    const logout = async () => {
        await userLogout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: user !== null,
                user,
                isLoading,
                refreshUser,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (context === null) {
        throw new Error("useAuth must be used within AuthProvider");
    }

    return context;
}
