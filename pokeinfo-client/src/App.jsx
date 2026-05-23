import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PokédexPage from "./pages/PokédexPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import CollectionDetailsPage from "./pages/CollectionDetailsPage";
import { useAuth } from "./hooks/useAuth";
import PokeInfoBrand from "./components/PokeInfoBrand";
import UserMenu from "./components/UserMenu";
import pokeInfoLogo from "./img/Poké-info_logo.png";
import "./styles/pokeInfoBrand.css";
import "./styles/navigation.css";

function App() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <>
            <nav className="main-nav">
                <div className="nav-brand">
                    <Link to="/" className="nav-logo">
                        <img src={pokeInfoLogo} alt="Poké-info" className="logo-img" />
                        <PokeInfoBrand />
                    </Link>
                    <Link to="/pokedex" className="nav-pokedex">Pokédex</Link>
                </div>

                <div className="nav-links">
                    {isAuthenticated ? (
                        <UserMenu onLogout={logout} />
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </div>
            </nav>

            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/pokedex" element={<PokédexPage />} />
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