import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, isAuthenticated } from "../services/authService";
import { updateProfile, changePassword, updateAccount } from "../services/userService";
import "../styles/colorPalette.css";
import "../styles/settings.css";

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeTab, setActiveTab] = useState("profile");
    const navigate = useNavigate();

    // Helper function to format friend code input
    const formatFriendCodeInput = (value) => {
        // Remove any non-digit characters and limit to 12 digits
        const cleaned = value.replace(/\D/g, "").slice(0, 12);
        // Format as XXXX-XXXX-XXXX as user types
        if (cleaned.length > 8) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`;
        } else if (cleaned.length > 4) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}`;
        }
        return cleaned;
    };

    // Profile form states
    const [displayName, setDisplayName] = useState("");
    const [profilePictureUrl, setProfilePictureUrl] = useState("");
    const [threedsFC, setThreedsFC] = useState("");
    const [switchFC, setSwitchFC] = useState("");
    const [showRankings, setShowRankings] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Password form states
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Account form states
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [accountPassword, setAccountPassword] = useState("");
    const [isUpdatingAccount, setIsUpdatingAccount] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login");
            return;
        }

        const currentUser = getCurrentUser();
        setDisplayName(currentUser?.displayName || "");
        setProfilePictureUrl(currentUser?.profilePictureUrl || "");
        setThreedsFC(currentUser?.threedsFC || "");
        setSwitchFC(currentUser?.switchFC || "");
        setShowRankings(currentUser?.showRankings || false);
        setUsername(currentUser?.username || "");
        setEmail(currentUser?.email || "");
        setLoading(false);
    }, [navigate]);

    async function handleSaveProfile(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        // Remove dashes and validate friend codes
        const cleanedThreedsFC = threedsFC.replace(/\D/g, "");
        const cleanedSwitchFC = switchFC.replace(/\D/g, "");

        if (cleanedThreedsFC && cleanedThreedsFC.length !== 12) {
            setError("3DS Friend Code must be exactly 12 digits.");
            return;
        }

        if (cleanedSwitchFC && cleanedSwitchFC.length !== 12) {
            setError("Switch Friend Code must be exactly 12 digits.");
            return;
        }

        try {
            setIsSavingProfile(true);
            const updatedUser = await updateProfile(displayName, profilePictureUrl, cleanedThreedsFC, cleanedSwitchFC, showRankings);

            // Update localStorage
            localStorage.setItem("user", JSON.stringify(updatedUser));

            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSavingProfile(false);
        }
    }

    async function handleChangePassword(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters long.");
            return;
        }

        try {
            setIsChangingPassword(true);
            await changePassword(currentPassword, newPassword, confirmPassword);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setSuccess("Password changed successfully!");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsChangingPassword(false);
        }
    }

    async function handleUpdateAccount(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!accountPassword) {
            setError("Password is required to update your account information.");
            return;
        }

        try {
            setIsUpdatingAccount(true);
            // Only send fields that have changed
            const updates = {};
            const currentUser = getCurrentUser();

            if (username !== currentUser?.username) {
                updates.username = username;
            }
            if (email !== currentUser?.email) {
                updates.email = email;
            }
            updates.currentPassword = accountPassword;

            // Only make the call if something changed
            if (Object.keys(updates).length > 1) {
                await updateAccount(updates.username || null, updates.email || null, accountPassword);

                // Update localStorage with new values
                const user = getCurrentUser();
                if (username !== currentUser?.username) {
                    user.username = username;
                }
                if (email !== currentUser?.email) {
                    user.email = email;
                }
                localStorage.setItem("user", JSON.stringify(user));

                setAccountPassword("");
                setSuccess("Account information updated successfully!");
            } else {
                setError("No changes to save.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUpdatingAccount(false);
        }
    }

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <main className="settings-page">
            <div className="settings-container">
                <header className="settings-header">
                    <h1>Settings</h1>
                    <button 
                        className="back-button" 
                        onClick={() => navigate("/profile")}
                    >
                        ← Back to Profile
                    </button>
                </header>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <div className="settings-tabs">
                    <button
                        className={`tab-button ${activeTab === "profile" ? "active" : ""}`}
                        onClick={() => setActiveTab("profile")}
                    >
                        Profile
                    </button>
                    <button
                        className={`tab-button ${activeTab === "account" ? "active" : ""}`}
                        onClick={() => setActiveTab("account")}
                    >
                        Account
                    </button>
                    <button
                        className={`tab-button ${activeTab === "password" ? "active" : ""}`}
                        onClick={() => setActiveTab("password")}
                    >
                        Password
                    </button>
                </div>

                {activeTab === "profile" && (
                    <form className="settings-form profile-form" onSubmit={handleSaveProfile}>
                        <h2>Profile Settings</h2>

                        <div className="form-group">
                            <label htmlFor="displayName">Display Name</label>
                            <input
                                id="displayName"
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Enter your display name"
                                maxLength="100"
                            />
                            <small>This is the name shown on your profile page</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="profilePictureUrl">Profile Picture URL</label>
                            <input
                                id="profilePictureUrl"
                                type="url"
                                value={profilePictureUrl}
                                onChange={(e) => setProfilePictureUrl(e.target.value)}
                                placeholder="https://example.com/picture.jpg"
                            />
                            {profilePictureUrl && (
                                <div className="preview-image">
                                    <img src={profilePictureUrl} alt="Profile preview" />
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label htmlFor="threedsFC">3DS Friend Code</label>
                            <input
                                id="threedsFC"
                                type="text"
                                value={threedsFC}
                                onChange={(e) => setThreedsFC(formatFriendCodeInput(e.target.value))}
                                placeholder="XXXX-XXXX-XXXX"
                                maxLength="14"
                            />
                            <small>12 digits (e.g., 1234-5678-9012)</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="switchFC">Switch Friend Code</label>
                            <input
                                id="switchFC"
                                type="text"
                                value={switchFC}
                                onChange={(e) => setSwitchFC(formatFriendCodeInput(e.target.value))}
                                placeholder="XXXX-XXXX-XXXX"
                                maxLength="14"
                            />
                            <small>12 digits (e.g., 1234-5678-9012)</small>
                        </div>

                        <div className="form-group checkbox">
                            <label htmlFor="showRankings">
                                <input
                                    id="showRankings"
                                    type="checkbox"
                                    checked={showRankings}
                                    onChange={(e) => setShowRankings(e.target.checked)}
                                />
                                Show rankings on my profile
                            </label>
                            <small>Toggle to show or hide your ranking information</small>
                        </div>

                        <button 
                            type="submit" 
                            className="save-button"
                            disabled={isSavingProfile}
                        >
                            {isSavingProfile ? "Saving..." : "Save Profile"}
                        </button>
                    </form>
                )}

                {activeTab === "password" && (
                    <form className="settings-form password-form" onSubmit={handleChangePassword}>
                        <h2>Change Password</h2>

                        <div className="form-group">
                            <label htmlFor="currentPassword">Current Password</label>
                            <input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter your current password"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter your new password"
                                required
                                minLength="6"
                            />
                            <small>At least 6 characters</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                required
                                minLength="6"
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="save-button"
                            disabled={isChangingPassword}
                        >
                            {isChangingPassword ? "Changing..." : "Change Password"}
                        </button>
                    </form>
                )}

                {activeTab === "account" && (
                    <form className="settings-form account-form" onSubmit={handleUpdateAccount}>
                        <h2>Account Information</h2>

                        <div className="form-group">
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter your username"
                                maxLength="50"
                            />
                            <small>Must be unique and cannot be the same as other users</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email address"
                                maxLength="100"
                            />
                            <small>Must be unique and cannot be the same as other users</small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="accountPassword">Current Password</label>
                            <input
                                id="accountPassword"
                                type="password"
                                value={accountPassword}
                                onChange={(e) => setAccountPassword(e.target.value)}
                                placeholder="Enter your password to confirm changes"
                                required
                            />
                            <small>Password is required to change your account information</small>
                        </div>

                        <button 
                            type="submit" 
                            className="save-button"
                            disabled={isUpdatingAccount}
                        >
                            {isUpdatingAccount ? "Updating..." : "Update Account"}
                        </button>
                    </form>
                )}
            </div>
        </main>
    );
}
