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

        setErrorMessage("");
        setIsSubmitting(true);

        try {
            await loginUser(formData);
            const currentUser = getCurrentUser();
            login(currentUser);
            navigate("/profile");
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="login-page">
            <section className="login-card">
                <h1>Login</h1>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="usernameOrEmail">Username or Email <span className="required">*</span></label>
                        <input
                            id="usernameOrEmail"
                            name="usernameOrEmail"
                            type="text"
                            placeholder="ashketchum"
                            value={formData.usernameOrEmail}
                            onChange={handleChange}
                            required
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

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                {errorMessage && (
                    <p className="error-message">{errorMessage}</p>
                )}

                <p className="register-link">
                    Don't have an account? <a href="/register">Register here</a>
                </p>
            </section>
        </main>
    );
}
