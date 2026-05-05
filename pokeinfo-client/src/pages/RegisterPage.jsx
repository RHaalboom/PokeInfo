import { useState } from "react";
import { registerUser } from "../services/authService";
import "../styles/register.css";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            const result = await registerUser(formData);
            setSuccessMessage(result.message || "Account succesfully created.");

            setFormData({
                username: "",
                email: "",
                password: ""
            });
        } catch (error) {
            setErrorMessage(error.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="register-page">
            <section className="register-card">
                <h1>Create your account</h1>
                <p>Create an account to start your Pokémon-collection!</p>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            maxLength="50"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">E-mail</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            maxLength="100"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength="6"
                        />
                    </div>

                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating account..." : "Account aanmaken"}
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