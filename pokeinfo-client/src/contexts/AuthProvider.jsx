import { useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { getAuthToken, getCurrentUser } from "../services/authService";

export function AuthProvider({ children }) {
    const [isAuthenticated, setIsAuthenticated] = useState(() => !!getAuthToken());
    const [user, setUser] = useState(() => getCurrentUser());

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

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}