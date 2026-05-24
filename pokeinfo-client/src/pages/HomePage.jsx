import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import PokeInfoBrand from "../components/PokeInfoBrand";
import pokeInfoLogo from "../img/Poké-info_logo.png";
import "../styles/colorPalette.css";
import "../styles/pokeInfoBrand.css";
import "../styles/landingPage.css";

export default function HomePage() {
    const { isAuthenticated } = useAuth();

    return (
        <main className="landing-page">
            <div className="landing-container">
                <div className="logo-section">
                    <img src={pokeInfoLogo} alt="Poké-info Logo" className="logo" />
                    <h1><PokeInfoBrand /></h1>
                    <p className="tagline">A central place for your Pokémon-information and maintaining your own collections!</p>
                </div>

                <div className="cta-section">
                    {isAuthenticated ? (
                        <Link to="/pokedex" className="cta-button primary" data-cy="home-explore-pokedex">
                            Explore Pokédex
                        </Link>
                    ) : (
                        <>
                            <div className="cta-buttons-group">
                                <Link to="/login" className="cta-button primary" data-cy="home-login-button">
                                    Login
                                </Link>
                                <Link to="/register" className="cta-button secondary" data-cy="home-register-button">
                                    Register
                                </Link>
                            </div>
                            <Link to="/pokedex" className="explore-link" data-cy="home-explore-link">
                                Or explore the Pokédex
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}