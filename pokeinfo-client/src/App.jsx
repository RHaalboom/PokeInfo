import { Routes, Route, Link, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import CollectionDetailsPage from "./pages/CollectionDetailsPage";
import { useAuth } from "./hooks/useAuth";
import { logout as logoutService } from "./services/authService";
import "./styles/navigation.css";

function App() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    function handleLogout() {
        logoutService();
        logout();
        navigate("/");
    }

    return (
        <>
            <nav className="main-nav">
                <Link to="/">Home</Link>

                {isAuthenticated ? (
                    <>
                        <Link to="/profile">Profile</Link>
                        <Link to="/settings">Settings</Link>
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
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/collections/:id" element={<CollectionDetailsPage />} />
            </Routes>
        </>
    );
}

export default App;