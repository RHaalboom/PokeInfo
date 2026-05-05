import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import { isAuthenticated, logout } from "./services/authService";
import "./styles/navigation.css";

function App() {
    const [isAuth, setIsAuth] = useState(isAuthenticated());
    const navigate = useNavigate();

    useEffect(() => {
        // Update auth state on mount and when localStorage changes
        const checkAuth = () => {
            setIsAuth(isAuthenticated());
        };

        checkAuth();
        window.addEventListener("storage", checkAuth);
        return () => window.removeEventListener("storage", checkAuth);
    }, []);

    function handleLogout() {
        logout();
        setIsAuth(false);
        navigate("/login");
    }

    return (
        <>
            <nav className="main-nav">
                <Link to="/">Home</Link>
                {isAuth ? (
                    <>
                        <Link to="/profile">Profile</Link>
                        <button onClick={handleLogout} className="logout-nav-btn">
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </nav>

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </>
    );
}

export default App;