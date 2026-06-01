import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { getAuthToken, getCurrentUser, validateToken } from "../services/authService";

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAuthToken());
    const [user, setUser] = useState(() => getCurrentUser());
    const [isValidating, setIsValidating] = useState(true);

    // Validate token on app startup
    useEffect(() => {
        const validateStoredToken = async () => {
            const token = getAuthToken();
            if (token) {
                try {
                    const userData = await validateToken();
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    // Token is invalid or expired, clear auth
                    console.warn("Stored token is invalid:", error.message);
                    setIsAuthenticated(false);
                    setUser(null);
                    localStorage.removeItem("authToken");
                    localStorage.removeItem("user");
                }
            }
            setIsValidating(false);
        };

        validateStoredToken();
    }, []);

    useEffect(() => {
        function handleStorageChange() {
            const token = getAuthToken();
            const currentUser = getCurrentUser();

            setIsAuthenticated(!!token);
            setUser(currentUser);
        }

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    function login(userData) {
        setUser(userData);
        setIsAuthenticated(true);
    }

    function logout() {
        setUser(null);
        setIsAuthenticated(false);
    }

    function updateUser(userData) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}