import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPokedexRanking } from "../services/rankingService";
import { useAuth } from "../hooks/useAuth";
import firstPlaceIcon from "../img/Profile/Poké-info_First_Place.png";
import secondPlaceIcon from "../img/Profile/Poké-info_Second_Place.png";
import thirdPlaceIcon from "../img/Profile/Poké-info_Third_Place.png";
import "../styles/rankings.css";

export default function RankingsPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [selectedPokedex, setSelectedPokedex] = useState("KANTO");
    const [rankings, setRankings] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Check authorization
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        // Only users with ShowRankings flag or Moderator/Admin roles can view rankings
        if (!user.showRankings && user.roleName !== "Moderator" && user.roleName !== "Admin") {
            navigate("/");
            return;
        }
    }, [user, navigate]);

    // Fetch rankings when selected Pokédex changes
    useEffect(() => {
        if (!user) return;

        const fetchRankings = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getPokedexRanking(selectedPokedex);
                setRankings(data);
            } catch (err) {
                setError(err.message);
                setRankings(null);
            } finally {
                setLoading(false);
            }
        };

        fetchRankings();
    }, [selectedPokedex, user]);

    const getRankIcon = (position) => {
        switch(position) {
            case 1:
                return firstPlaceIcon;
            case 2:
                return secondPlaceIcon;
            case 3:
                return thirdPlaceIcon;
            default:
                return null;
        }
    };

    const getRankDisplay = (position) => {
        const icon = getRankIcon(position);
        if (icon) {
            return (
                <img 
                    src={icon} 
                    alt={`Place ${position}`} 
                    className="rank-badge-small" 
                    title={`${position}${position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'} Place`}
                />
            );
        }
        return <span className="position-number">{position}</span>;
    };

    const pokedexOptions = [
        { key: "KANTO", name: "Kanto" },
        { key: "JOHTO", name: "Johto" },
        { key: "HOENN", name: "Hoenn" },
        { key: "SINNOH", name: "Sinnoh" },
        { key: "UNOVA", name: "Unova" },
        { key: "KALOS", name: "Kalos" },
        { key: "ALOLA", name: "Alola" },
        { key: "GALAR", name: "Galar" },
        { key: "HISUI", name: "Hisui" },
        { key: "PALDEA", name: "Paldea" }
    ];

    return (
        <main className="rankings-page" data-cy="rankings-page">
            <section className="rankings-container">
                <div className="rankings-header">
                    <h1>Pokédex Rankings</h1>
                    <p className="rankings-description">Compete with other collectors to complete regional Pokédexes.</p>
                </div>

                <div className="rankings-controls">
                    <label htmlFor="pokedex-selector" className="pokedex-label">Select Region:</label>
                    <select
                        id="pokedex-selector"
                        className="pokedex-selector"
                        value={selectedPokedex}
                        onChange={(e) => setSelectedPokedex(e.target.value)}
                        data-cy="pokedex-selector"
                    >
                        {pokedexOptions.map(option => (
                            <option key={option.key} value={option.key}>
                                {option.name}
                            </option>
                        ))}
                    </select>
                </div>

                {loading && (
                    <div className="loading-state" data-cy="rankings-loading">
                        <p>Loading rankings...</p>
                    </div>
                )}

                {error && (
                    <div className="error-state" data-cy="rankings-error">
                        <p className="error-message">{error}</p>
                    </div>
                )}

                {rankings && !loading && (
                    <>
                        <div className="rankings-info">
                            <h2>{rankings.pokedexName} Rankings</h2>
                            <p className="total-pokemon">Total Pokémon: {rankings.totalPokemon}</p>
                        </div>

                        <div className="rankings-content">
                            {rankings.rankings.length === 0 ? (
                                <div className="no-rankings" data-cy="no-rankings">
                                    <p>No rankings available yet for {rankings.pokedexName}.</p>
                                </div>
                            ) : (
                                <div className="rankings-table-wrapper">
                                    <table className="rankings-table" data-cy="rankings-table">
                                    <thead>
                                        <tr>
                                            <th className="col-position">#</th>
                                            <th className="col-name">Trainer</th>
                                            <th className="col-progress">Progress</th>
                                            <th className="col-percentage">Percentage</th>
                                            <th className="col-date">Completion Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rankings.rankings.map((entry, index) => (
                                            <tr
                                                key={index}
                                                className={`ranking-row ${entry.isCompleted ? "completed" : ""}`}
                                                data-cy={`ranking-row-${entry.position}`}
                                            >
                                                <td className="col-position">
                                                    <span className="position-badge">
                                                        {getRankDisplay(entry.position)}
                                                    </span>
                                                </td>
                                                <td className="col-name">
                                                    <span className="trainer-name">{entry.displayName}</span>
                                                </td>
                                                <td className="col-progress">
                                                    <span className="progress-text">{entry.collected} / {entry.total}</span>
                                                </td>
                                                <td className="col-percentage">
                                                    <div className="percentage-display">
                                                        <div className="percentage-bar">
                                                            <div
                                                                className="percentage-fill"
                                                                style={{ width: `${entry.percentage}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="percentage-text">{entry.percentage}%</span>
                                                    </div>
                                                </td>
                                                <td className="col-date">
                                                    {entry.isCompleted && entry.completionDate ? (
                                                        <span className="completion-date" data-cy={`completion-date-${entry.position}`}>
                                                            {new Date(entry.completionDate).toLocaleDateString()}
                                                        </span>
                                                    ) : (
                                                        <span className="no-date">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            )}
                        </div>
                    </>
                )}
            </section>
        </main>
    );
}
