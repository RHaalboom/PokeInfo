import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, getCurrentUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import "../styles/colorPalette.css";
import "../styles/login.css";

export default function LoginPage() {
    const [formData, setFormData] = useState({
        usernameOrEmail: "",
        password: ""
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [formError, setFormError] = useState("");
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
        setFormError("");
        setIsSubmitting(true);

        try {
            console.log("Attempting login with credentials:", { usernameOrEmail: formData.usernameOrEmail });
            await loginUser(formData);
            const currentUser = getCurrentUser();
            login(currentUser);

            setSuccessMessage("Login successful! Redirecting...");

            setTimeout(() => {
                navigate("/profile");
            }, 500);
        } catch (error) {
            // For login, show a single error message above the button
            console.error("Login error caught:", error?.message || error);
            // Check if it's a ban error
            const isBanError = error?.message?.includes("banned");
            const errorMessage = isBanError
                ? "Your account has been banned and you cannot log in. For more information, please contact: xxxxx@xxxxx.com"
                : error?.message || "Username and/or password is incorrect. Please try again";
            console.log("Setting form error to:", errorMessage);
            setFormError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="login-page" data-cy="login-page">
            <section className="login-card">
                <h1>Login</h1>

                <form onSubmit={handleSubmit} className="login-form" noValidate>
                    <div className="form-group">
                        <label htmlFor="usernameOrEmail">Username or Email <span className="required">*</span></label>
                        <input
                            id="usernameOrEmail"
                            name="usernameOrEmail"
                            type="text"
                            placeholder="ashketchum"
                            value={formData.usernameOrEmail}
                            onChange={handleChange}
                            className={formError ? "input-error" : ""}
                            data-cy="login-email"
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
                            className={formError ? "input-error" : ""}
                            data-cy="login-password"
                        />
                    </div>

                    {formError ? (
                        <div className="form-error-message" data-cy="login-error-message">
                            {formError}
                        </div>
                    ) : null}

                    {successMessage ? (
                        <div className="success-message" data-cy="login-success-message">
                            {successMessage}
                        </div>
                    ) : null}

                    <button type="submit" disabled={isSubmitting} data-cy="login-submit">
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="register-link">
                    Don't have an account? <a href="/register" data-cy="login-register-link">Register here</a>
                </p>
            </section>
        </main>
    );
}
