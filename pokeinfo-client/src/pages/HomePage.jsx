import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import pokeInfoLogo from "../img/Poké-info_logo.png";
import "../styles/colorPalette.css";
import "../styles/landingPage.css";

export default function HomePage() {
    const { isAuthenticated } = useAuth();

    return (
        <main className="landing-page">
            <div className="landing-container">
                <div className="logo-section">
                    <img src={pokeInfoLogo} alt="Poké-info Logo" className="logo" />
                    <h1>Poké-info</h1>
                    <p className="tagline">A central place for your Pokémon-information and maintaining your own collection!</p>
                </div>

                <div className="cta-section">
                    {isAuthenticated ? (
                        <Link to="/pokedex" className="cta-button primary">
                            Explore Pokédex
                        </Link>
                    ) : (
                        <>
                            <div className="cta-buttons-group">
                                <Link to="/login" className="cta-button primary">
                                    Login
                                </Link>
                                <Link to="/register" className="cta-button secondary">
                                    Register
                                </Link>
                            </div>
                            <Link to="/pokedex" className="explore-link">
                                Or explore the Pokédex
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}