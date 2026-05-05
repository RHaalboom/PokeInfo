import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout, isAuthenticated, getAllUsers } from "../services/authService";
import "../styles/profile.css";

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login");
            return;
        }

        const currentUser = getCurrentUser();
        setUser(currentUser);

        // Fetch all users if moderator
        if (currentUser?.roleName === "Moderator") {
            fetchUsers();
        } else {
            setLoading(false);
        }
    }, [navigate]);

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
        logout();
        navigate("/login");
    }

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <main className="profile-page">
            <section className="profile-header">
                <div className="profile-info">
                    <h1>Welcome, {user?.username}!</h1>
                    <p>Email: {user?.email}</p>
                    <p>Role: {user?.roleName}</p>
                </div>
                <button className="logout-button" onClick={handleLogout}>
                    Logout
                </button>
            </section>

            {user?.roleName === "RankedUser" && (
                <section className="rankings-section">
                    <h2>Your Rankings</h2>
                    <p>Ranking data would be displayed here</p>
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
        </main>
    );
}
