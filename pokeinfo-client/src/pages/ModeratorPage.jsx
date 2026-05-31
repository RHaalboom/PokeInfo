import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers, banUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import "../styles/moderator.css";

export default function ModeratorPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedRole, setSelectedRole] = useState(null); // null = show all
    const [banningUserId, setBanningUserId] = useState(null);
    const [roles, setRoles] = useState([]);
    const [changingRoleUserId, setChangingRoleUserId] = useState(null);

    // Role order: Admin (4), Moderator (3), RankedUser (2), User (1)
    const roleOrder = { 4: 0, 3: 1, 2: 2, 1: 3 };

    // Check authorization
    useEffect(() => {
        if (!user) {
            navigate("/login");
            return;
        }

        // Only Admin and Moderator can access this page
        if (user.roleName !== "Admin" && user.roleName !== "Moderator") {
            navigate("/");
            return;
        }
    }, [user, navigate]);

    // Fetch users
    useEffect(() => {
        if (!user) return;

        const fetchUsers = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await getAllUsers();
                // Sort by role (Admin, Moderator, RankedUser, User)
                const sorted = [...data].sort((a, b) => {
                    const orderA = roleOrder[a.roleId] ?? 999;
                    const orderB = roleOrder[b.roleId] ?? 999;
                    return orderA - orderB;
                });
                setUsers(sorted);
                setFilteredUsers(sorted);
            } catch (err) {
                setError(err.message || "Failed to fetch users");
                setUsers([]);
                setFilteredUsers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user]);

    // Fetch available roles
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch("https://localhost:7024/api/auth/roles");
                if (!response.ok) throw new Error("Failed to fetch roles");
                const data = await response.json();
                setRoles(data);
            } catch (err) {
                console.error("Error fetching roles:", err);
            }
        };

        fetchRoles();
    }, []);

    // Filter users based on search query and selected role
    useEffect(() => {
        let filtered = [...users];

        // Filter by role if selected
        if (selectedRole !== null) {
            filtered = filtered.filter(u => u.roleId === selectedRole);
        }

        // Filter by search query (username, email, displayName)
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(u =>
                (u.username?.toLowerCase().includes(query)) ||
                (u.email?.toLowerCase().includes(query)) ||
                (u.displayName?.toLowerCase().includes(query))
            );
        }

        setFilteredUsers(filtered);
    }, [searchQuery, selectedRole, users]);

    const handleBanUser = async (userId, username, currentBannedStatus) => {
        const action = currentBannedStatus === 1 ? "unban" : "ban";
        if (!window.confirm(`Are you sure you want to ${action} user "${username}"?`)) {
            return;
        }

        setBanningUserId(userId);
        try {
            await banUser(userId);
            // Update the user in the list by toggling their ban status
            setUsers(users.map(u => 
                u.id === userId 
                    ? { ...u, banned: u.banned === 1 ? null : 1 }
                    : u
            ));
            setError("");
        } catch (err) {
            setError(err.message || "Failed to ban/unban user");
        } finally {
            setBanningUserId(null);
        }
    };

    const handleChangeRole = async (userId, username, newRoleId) => {
        // Admin-only feature
        if (user.roleName !== "Admin") {
            setError("Only admins can change user roles");
            return;
        }

        const newRole = roles.find(r => r.id === newRoleId);
        if (!window.confirm(`Are you sure you want to change "${username}" role to "${newRole?.name}"?`)) {
            return;
        }

        setChangingRoleUserId(userId);
        try {
            const token = localStorage.getItem("authToken");
            const response = await fetch(`https://localhost:7024/api/auth/users/${userId}/role/${newRoleId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to change user role");
            }

            // Update the user in the list
            setUsers(users.map(u => 
                u.id === userId 
                    ? { ...u, roleId: newRoleId, roleName: newRole.name }
                    : u
            ));
            setError("");
        } catch (err) {
            setError(err.message || "Failed to change user role");
        } finally {
            setChangingRoleUserId(null);
        }
    };

    const getRoleColor = (roleId) => {
        switch (roleId) {
            case 4:
                return "admin";
            case 3:
                return "moderator";
            case 2:
                return "ranked";
            case 1:
            default:
                return "user";
        }
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <main className="moderator-page" data-cy="moderator-page">
            <section className="moderator-header">
                <h1>User Management</h1>
                <p>View and manage all users on the platform</p>
            </section>

            {error && <div className="error-message">{error}</div>}

            <section className="moderator-controls">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Search by username, email, or display name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                        data-cy="user-search-input"
                    />
                </div>

                <div className="role-filters">
                    <button
                        className={`role-filter-btn ${selectedRole === null ? "active" : ""}`}
                        onClick={() => setSelectedRole(null)}
                        data-cy="filter-all-roles"
                    >
                        All Roles
                    </button>
                    <button
                        className={`role-filter-btn admin ${selectedRole === 4 ? "active" : ""}`}
                        onClick={() => setSelectedRole(4)}
                        data-cy="filter-admin"
                    >
                        Admin
                    </button>
                    <button
                        className={`role-filter-btn moderator ${selectedRole === 3 ? "active" : ""}`}
                        onClick={() => setSelectedRole(3)}
                        data-cy="filter-moderator"
                    >
                        Moderator
                    </button>
                    <button
                        className={`role-filter-btn ranked ${selectedRole === 2 ? "active" : ""}`}
                        onClick={() => setSelectedRole(2)}
                        data-cy="filter-ranked"
                    >
                        Ranked Users
                    </button>
                    <button
                        className={`role-filter-btn user ${selectedRole === 1 ? "active" : ""}`}
                        onClick={() => setSelectedRole(1)}
                        data-cy="filter-user"
                    >
                        Users
                    </button>
                </div>
            </section>

            <section className="moderator-content">
                {filteredUsers.length === 0 ? (
                    <div className="no-results">
                        <p>No users found</p>
                    </div>
                ) : (
                    <div className="users-table-container">
                        <table className="users-table" data-cy="users-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Display Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} data-cy={`user-row-${u.id}`}>
                                        <td className="username-cell">{u.username}</td>
                                        <td className="displayname-cell">{u.displayName || "-"}</td>
                                        <td className="email-cell">{u.email}</td>
                                        <td className="role-cell">
                                            {user.roleName === "Admin" && u.roleName !== "Admin" ? (
                                                <select
                                                    className={`role-select role-${getRoleColor(u.roleId)}`}
                                                    value={u.roleId}
                                                    onChange={(e) => handleChangeRole(u.id, u.username, parseInt(e.target.value))}
                                                    disabled={changingRoleUserId === u.id}
                                                    data-cy={`role-select-${u.id}`}
                                                >
                                                    {roles.map(role => (
                                                        <option key={role.id} value={role.id}>
                                                            {role.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <span className={`role-badge role-${getRoleColor(u.roleId)}`}>
                                                    {u.roleName}
                                                </span>
                                            )}
                                        </td>
                                        <td className="status-cell">
                                            {u.banned === 1 ? (
                                                <span className="banned-badge">Banned</span>
                                            ) : (
                                                <span className="active-badge">Active</span>
                                            )}
                                        </td>
                                        <td className="actions-cell">
                                            {user.id !== u.id && u.roleName !== "Admin" && (
                                                <button
                                                    className="ban-button"
                                                    onClick={() => handleBanUser(u.id, u.username, u.banned)}
                                                    disabled={banningUserId === u.id}
                                                    title={u.banned === 1 ? "Unban this user" : "Ban this user from logging in"}
                                                    data-cy={`ban-button-${u.id}`}
                                                >
                                                    {banningUserId === u.id ? (u.banned === 1 ? "Unbanning..." : "Banning...") : (u.banned === 1 ? "Unban" : "Ban")}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="user-count">
                    Showing {filteredUsers.length} of {users.length} users
                </div>
            </section>
        </main>
    );
}
