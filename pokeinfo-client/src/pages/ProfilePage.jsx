import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout as logoutService, isAuthenticated, getAllUsers } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import CollectionsSection from "../components/CollectionsSection";
import CircularProgress from "../components/CircularProgress";
import { calculatePokedexProgress } from "../utils/pokedexProgress";
import { getCollections } from "../services/collectionService";
import "../styles/colorPalette.css";
import "../styles/profile.css";

const POKEDEX_LIST = ['KANTO', 'JOHTO', 'HOENN', 'SINNOH', 'UNOVA', 'KALOS', 'ALOLA', 'GALAR', 'HISUI', 'PALDEA'];

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pokedexProgress, setPokedexProgress] = useState({});
    const navigate = useNavigate();
    const { logout } = useAuth();

    // Helper function to format friend codes with dashes
    const formatFriendCode = (code) => {
        if (!code) return "";
        // Remove any existing dashes and format as XXXX-XXXX-XXXX
        const cleaned = code.replace(/\D/g, "").slice(0, 12);
        if (cleaned.length === 12) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
        }
        return cleaned;
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login");
            return;
        }

        const currentUser = getCurrentUser();
        setUser(currentUser);

        // Fetch collections for Pokédex progress
        fetchCollectionsAndProgress();

        // Fetch all users if moderator
        if (currentUser?.roleName === "Moderator") {
            fetchUsers();
        } else {
            setLoading(false);
        }
    }, [navigate]);

    async function fetchCollectionsAndProgress() {
        try {
            const data = await getCollections();
            const progress = calculatePokedexProgress(data);
            setPokedexProgress(progress);
        } catch (err) {
            console.error("Error fetching collections:", err);
            // If there's an error, just set empty progress
            setPokedexProgress(
                POKEDEX_LIST.reduce((acc, pokedex) => {
                    acc[pokedex] = 0;
                    return acc;
                }, {})
            );
        }
    }

    async function fetchUsers() {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    function handleLogout() {
        logoutService();
        logout();
        navigate("/");
    }

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <main className="profile-page">
            <section className="profile-header">
                <div className="profile-info">
                    {user?.profilePictureUrl && (
                        <img 
                            src={user.profilePictureUrl} 
                            alt={user.displayName || user.username}
                            className="profile-picture"
                        />
                    )}
                    <div className="profile-text">
                        <h1>{user?.displayName || user?.username}</h1>
                        <div className="profile-friend-codes">
                            <p className="profile-fc">3DS FC: {formatFriendCode(user?.threedsFC) || "XXXX-XXXX-XXXX"}</p>
                            <p className="profile-fc">Switch FC: {formatFriendCode(user?.switchFC) || "XXXX-XXXX-XXXX"}</p>
                        </div>
                    </div>
                </div>
                <div className="profile-actions">
                    <button 
                        className="settings-button" 
                        onClick={() => navigate("/settings")}
                    >
                        ⚙️ Settings
                    </button>
                    <button className="logout-button" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </section>

            {/* Rankings Section - shown if user has ShowRankings enabled */}
            {user?.showRankings && (
                <section className="rankings-section">
                    <div className="rankings-header">
                        <h2>Ranking Information</h2>
                    </div>
                    <div className="rankings-content">
                        {POKEDEX_LIST.map((pokedex) => (
                            <CircularProgress
                                key={pokedex}
                                percentage={pokedexProgress[pokedex] || 0}
                                pokedexName={pokedex}
                            />
                        ))}
                    </div>
                </section>
            )}

            {user?.roleName === "Moderator" && (
                <section className="moderator-section">
                    <h2>All Users</h2>
                    {error && <p className="error-message">{error}</p>}
                    {users && (
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td>{u.id}</td>
                                        <td>{u.username}</td>
                                        <td>{u.email}</td>
                                        <td>{u.roleName}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </section>
            )}

            <CollectionsSection />
        </main>
    );
}
