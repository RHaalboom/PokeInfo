import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, loginUser, getCurrentUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { updateProfile } from "../services/userService";
import { createCollection } from "../services/collectionService";
import "../styles/colorPalette.css";
import "../styles/register.css";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        threedsFC: "",
        switchFC: "",
        collectionName: ""
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");
        setIsSubmitting(true);

        try {
            // Register the user with basic info
            const registerData = {
                username: formData.username,
                email: formData.email,
                password: formData.password
            };

            const result = await registerUser(registerData);
            setSuccessMessage(result.message || "Account successfully created.");

            // Auto-login after successful registration
            await loginUser({ usernameOrEmail: formData.username, password: formData.password });
            const currentUser = getCurrentUser();
            login(currentUser);

            // Update profile with friend codes if provided
            if (formData.threedsFC || formData.switchFC) {
                try {
                    await updateProfile(currentUser.displayName, currentUser.profilePictureUrl, formData.threedsFC, formData.switchFC, currentUser.roleId === 2);
                } catch (profileError) {
                    console.error("Error updating profile with friend codes:", profileError);
                }
            }

            // Create initial collection if provided
            if (formData.collectionName.trim()) {
                try {
                    await createCollection(formData.collectionName, "");
                } catch (collectionError) {
                    console.error("Error creating collection:", collectionError);
                }
            }

            // Navigate to profile after everything is set up
            setTimeout(() => {
                navigate("/profile");
            }, 500);

            setFormData({
                username: "",
                email: "",
                password: "",
                threedsFC: "",
                switchFC: "",
                collectionName: ""
            });
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    // Helper function to format friend codes with dashes
    const formatFriendCode = (code) => {
        if (!code) return "";
        // Remove any existing dashes
        const cleaned = code.replace(/\D/g, "").slice(0, 12);
        if (cleaned.length > 0 && cleaned.length <= 12) {
            return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 8)}-${cleaned.slice(8, 12)}`.replace(/-+$/, "");
        }
        return cleaned;
    };

    function handleFriendCodeChange(event) {
        const { name, value } = event.target;
        const formatted = formatFriendCode(value);

        setFormData((previousData) => ({
            ...previousData,
            [name]: formatted
        }));
    }

    return (
        <main className="register-page">
            <section className="register-card">
                <h1>Register</h1>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label htmlFor="username">Username <span className="required">*</span></label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="ashketchum"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            maxLength="50"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">E-mail <span className="required">*</span></label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="ashketchum@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            maxLength="100"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password <span className="required">*</span></label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />
                    </div>

                    <div className="form-divider"></div>

                    <div className="form-group">
                        <label htmlFor="threedsFC">3DS Friend Code</label>
                        <input
                            id="threedsFC"
                            name="threedsFC"
                            type="text"
                            placeholder="XXXX-XXXX-XXXX"
                            value={formData.threedsFC}
                            onChange={handleFriendCodeChange}
                            maxLength="14"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="switchFC">Switch Friend Code</label>
                        <input
                            id="switchFC"
                            name="switchFC"
                            type="text"
                            placeholder="XXXX-XXXX-XXXX"
                            value={formData.switchFC}
                            onChange={handleFriendCodeChange}
                            maxLength="14"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="collectionName">Initial Collection Name</label>
                        <input
                            id="collectionName"
                            name="collectionName"
                            type="text"
                            placeholder="My First Collection"
                            value={formData.collectionName}
                            onChange={handleChange}
                            maxLength="100"
                        />
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                </form>

                {successMessage && (
                    <p className="success-message">{successMessage}</p>
                )}

                {errorMessage && (
                    <p className="error-message">{errorMessage}</p>
                )}
            </section>
        </main>
    );
}