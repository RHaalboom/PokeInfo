import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout as logoutService, isAuthenticated, getAllUsers } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import CollectionsSection from "../components/CollectionsSection";
import OverallProgress from "../components/OverallProgress";
import RegionalProgress from "../components/RegionalProgress";
import { calculateOverallProgress, calculatePokedexProgress, POKEDEX_DATA } from "../utils/pokedexProgress";
import { getCollections } from "../services/collectionService";
import { getAllRankings } from "../services/rankingService";
import settingsIcon from "../img/Poké-info_Settings.png";
import settingsIconHover from "../img/Poké-info_Settings_hover.png";
import logoutIcon from "../img/Poké-info_Logout.png";
import logoutIconHover from "../img/Poké-info_Logout_hover.png";
import threedsIcon from "../img/Profile/Poké-info_3ds.png";
import switchIcon from "../img/Profile/Poké-info_Switch.png";
import "../styles/colorPalette.css";
import "../styles/profile.css";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [overallProgress, setOverallProgress] = useState(null);
    const [regionalProgress, setRegionalProgress] = useState(null);
    const [regionalRanks, setRegionalRanks] = useState({});
    const [hoveredButton, setHoveredButton] = useState(null);
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

    // Helper function to format join date
    const formatJoinDate = (createdDate) => {
        if (!createdDate) return "";
        try {
            const date = new Date(createdDate);
            // Check if date is valid
            if (isNaN(date.getTime())) return "";
            const options = { year: 'numeric', month: 'long' };
            return `Trainer since ${date.toLocaleDateString('en-US', options)}`;
        } catch (err) {
            console.error("Error formatting date:", err);
            return "";
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login");
            return;
        }

        const currentUser = getCurrentUser();
        setUser(currentUser);
        console.log("Current user:", currentUser);

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
            const progress = calculateOverallProgress(data);
            const regionalProgData = calculatePokedexProgress(data);
            setOverallProgress(progress);
            setRegionalProgress(regionalProgData);

            // Fetch rankings if user has RankedUser or Moderator role
            const currentUser = getCurrentUser();
            if (currentUser?.roleName === "RankedUser" || currentUser?.roleName === "Moderator") {
                await fetchUserRankings(currentUser.username);
            }
        } catch (err) {
            console.error("Error fetching collections:", err);
            // If there's an error, just set default progress
            setOverallProgress({
                collected: 0,
                totalAvailable: 1025,
                percentage: 0
            });
            setRegionalProgress({
                KANTO: 0,
                JOHTO: 0,
                HOENN: 0,
                SINNOH: 0,
                UNOVA: 0,
                KALOS: 0,
                ALOLA: 0,
                GALAR: 0,
                HISUI: 0,
                PALDEA: 0
            });
        }
    }

    async function fetchUserRankings(username) {
        try {
            const currentUser = getCurrentUser();
            const allRankings = await getAllRankings();
            console.log("Current user object:", currentUser);
            console.log("Username for matching:", username);
            console.log("Display name for matching:", currentUser?.displayName);
            console.log("All rankings data:", allRankings);

            if (allRankings && Array.isArray(allRankings)) {
                const ranks = {};
                // For each Pokédex, find this user's ranking position
                allRankings.forEach(ranking => {
                    console.log(`Checking ranking for ${ranking.pokedexKey}:`, ranking.rankings);
                    const userEntry = ranking.rankings.find(entry => {
                        // Match against either username or displayName
                        const matchesUsername = entry.displayName.toLowerCase() === username.toLowerCase();
                        const matchesDisplayName = currentUser?.displayName && 
                                                   entry.displayName.toLowerCase() === currentUser.displayName.toLowerCase();
                        const matches = matchesUsername || matchesDisplayName;
                        console.log(`Comparing "${entry.displayName}" with username "${username}" or displayName "${currentUser?.displayName}" = ${matches}`);
                        return matches;
                    });
                    console.log(`User entry for ${ranking.pokedexKey}:`, userEntry);
                    if (userEntry) {
                        ranks[ranking.pokedexKey] = userEntry.position;
                    }
                });
                console.log("Final ranks object:", ranks);
                setRegionalRanks(ranks);
            }
        } catch (err) {
            console.error("Error fetching rankings:", err);
            // Silently fail - rankings are optional
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
        <main className="profile-page" data-cy="profile-page">
            <section className="profile-header">
                <div className="profile-left">
                    {user?.profilePictureUrl && (
                        <img 
                            src={user.profilePictureUrl} 
                            alt={user.displayName || user.username}
                            className="profile-picture"
                        />
                    )}
                </div>

                <div className="profile-center">
                    <div className="profile-text">
                        <h1>{user?.displayName || user?.username}</h1>
                        {formatJoinDate(user?.createdAt) && (
                            <p className="profile-join-date">{formatJoinDate(user?.createdAt)}</p>
                        )}
                    </div>
                    <div className="profile-friend-codes">
                        <div className="friend-code-item">
                            <img src={threedsIcon} alt="3DS" className="fc-icon-img" />
                            <span className="fc-label">3DS Friend Code</span>
                            <span className="fc-value">{formatFriendCode(user?.threedsFC) || "XXXX-XXXX-XXXX"}</span>
                        </div>
                        <div className="friend-code-item">
                            <img src={switchIcon} alt="Switch" className="fc-icon-img" />
                            <span className="fc-label">Switch Friend Code</span>
                            <span className="fc-value">{formatFriendCode(user?.switchFC) || "XXXX-XXXX-XXXX"}</span>
                        </div>
                    </div>
                </div>

                <div className="profile-actions">
                    <button 
                        className="settings-button" 
                        onClick={() => navigate("/settings")}
                        onMouseEnter={() => setHoveredButton('settings')}
                        onMouseLeave={() => setHoveredButton(null)}
                        title="Go to Settings"
                    >
                        <img 
                            src={hoveredButton === 'settings' ? settingsIconHover : settingsIcon} 
                            alt="Settings" 
                            className="button-icon"
                        />
                        Settings
                    </button>
                    <button 
                        className="logout-button" 
                        data-cy="logout-button" 
                        onClick={handleLogout}
                        onMouseEnter={() => setHoveredButton('logout')}
                        onMouseLeave={() => setHoveredButton(null)}
                        title="Logout"
                    >
                        <img 
                            src={hoveredButton === 'logout' ? logoutIconHover : logoutIcon} 
                            alt="Logout" 
                            className="button-icon"
                        />
                        Logout
                    </button>
                </div>
            </section>

            {/* Overall Progress Section */}
            {overallProgress && (
                <section className="overall-progress-section">
                    <OverallProgress 
                        collected={overallProgress.collected}
                        totalAvailable={overallProgress.totalAvailable}
                        percentage={overallProgress.percentage}
                    />
                </section>
            )}

            {/* Regional Progress Section */}
            {regionalProgress && (
                <section className="regional-progress-section">
                    <RegionalProgress 
                        pokedexProgress={regionalProgress}
                        pokedexData={POKEDEX_DATA}
                        regionalRanks={regionalRanks}
                    />
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
