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

    const [fieldErrors, setFieldErrors] = useState({
        username: "",
        email: "",
        password: "",
        threedsFC: "",
        switchFC: "",
        collectionName: ""
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));

        // Only validate if the form has been submitted
        if (!formSubmitted) {
            return;
        }

        // Validate field on change and clear error if valid
        if (name === "username" && value.trim()) {
            if (value.trim().length < 3) {
                setFieldErrors((prev) => ({
                    ...prev,
                    username: "Username must be at least 3 characters long"
                }));
            } else {
                setFieldErrors((prev) => ({
                    ...prev,
                    username: ""
                }));
            }
        } else if (name === "username" && !value.trim()) {
            setFieldErrors((prev) => ({
                ...prev,
                username: ""
            }));
        }

        if (name === "email" && value.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                setFieldErrors((prev) => ({
                    ...prev,
                    email: "Please enter a valid email address"
                }));
            } else {
                setFieldErrors((prev) => ({
                    ...prev,
                    email: ""
                }));
            }
        } else if (name === "email" && !value.trim()) {
            setFieldErrors((prev) => ({
                ...prev,
                email: ""
            }));
        }

        if (name === "password" && value) {
            if (value.length < 6) {
                setFieldErrors((prev) => ({
                    ...prev,
                    password: "Password must be at least 6 characters long"
                }));
            } else {
                setFieldErrors((prev) => ({
                    ...prev,
                    password: ""
                }));
            }
        } else if (name === "password" && !value) {
            setFieldErrors((prev) => ({
                ...prev,
                password: ""
            }));
        }
    }

    function validateForm() {
        const errors = {
            username: "",
            email: "",
            password: "",
            threedsFC: "",
            switchFC: "",
            collectionName: ""
        };

        // Validate required fields
        if (!formData.username.trim()) {
            errors.username = "Username is required";
        } else if (formData.username.trim().length < 3) {
            errors.username = "Username must be at least 3 characters long";
        }

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = "Please enter a valid email address";
            }
        }

        if (!formData.password) {
            errors.password = "Password is required";
        } else if (formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters long";
        }

        setFieldErrors(errors);
        return !errors.username && !errors.email && !errors.password;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        // Mark form as submitted so errors show
        setFormSubmitted(true);

        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        setSuccessMessage("");
        setIsSubmitting(true);

        try {
            // Register the user with basic info
            const registerData = {
                username: formData.username,
                email: formData.email,
                password: formData.password
            };

            const result = await registerUser(registerData);
            setSuccessMessage(result.message || "Account successfully created!");

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
            }, 2000);

            setFormData({
                username: "",
                email: "",
                password: "",
                threedsFC: "",
                switchFC: "",
                collectionName: ""
            });
        } catch (error) {
            // Parse error message and associate with fields
            const errorMessage = error.message || "Registration failed. Please try again.";

            // Map common error messages to fields
            const newFieldErrors = {
                username: "",
                email: "",
                password: "",
                threedsFC: "",
                switchFC: "",
                collectionName: ""
            };

            if (errorMessage.toLowerCase().includes("username")) {
                newFieldErrors.username = errorMessage;
            } else if (errorMessage.toLowerCase().includes("email")) {
                newFieldErrors.email = errorMessage;
            } else if (errorMessage.toLowerCase().includes("password")) {
                newFieldErrors.password = errorMessage;
            } else {
                // If we can't determine which field, show on the first empty required field
                if (!formData.username) {
                    newFieldErrors.username = errorMessage;
                } else if (!formData.email) {
                    newFieldErrors.email = errorMessage;
                } else if (!formData.password) {
                    newFieldErrors.password = errorMessage;
                } else {
                    newFieldErrors.email = errorMessage;
                }
            }

            setFieldErrors(newFieldErrors);
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

                <form onSubmit={handleSubmit} className="register-form" noValidate>
                    <div className="form-group">
                        <label htmlFor="username">Username <span className="required">*</span></label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            placeholder="ashketchum"
                            value={formData.username}
                            onChange={handleChange}
                            maxLength="50"
                            data-cy="register-username"
                            className={formSubmitted && fieldErrors.username ? "input-error" : ""}
                        />
                        {formSubmitted && fieldErrors.username && (
                            <span className="field-error-message" data-cy="register-username-error" data-cy="register-error-message">{fieldErrors.username}</span>
                        )}
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
                            maxLength="100"
                            data-cy="register-email"
                            className={formSubmitted && fieldErrors.email ? "input-error" : ""}
                        />
                        {formSubmitted && fieldErrors.email && (
                            <span className="field-error-message" data-cy="register-email-error" data-cy="register-error-message">{fieldErrors.email}</span>
                        )}
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
                            data-cy="register-password"
                            className={formSubmitted && fieldErrors.password ? "input-error" : ""}
                        />
                        {formSubmitted && fieldErrors.password && (
                            <span className="field-error-message" data-cy="register-password-error" data-cy="register-error-message">{fieldErrors.password}</span>
                        )}
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
                            data-cy="register-threedsFC"
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
                            data-cy="register-switchFC"
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
                            data-cy="register-collectionName"
                        />
                    </div>

                    <button type="submit" disabled={isSubmitting} data-cy="register-submit">
                        {isSubmitting ? "Creating account..." : "Create account"}
                    </button>
                </form>

                {successMessage && (
                    <p className="success-message" data-cy="register-success-message">{successMessage}</p>
                )}
            </section>
        </main>
    );
}
