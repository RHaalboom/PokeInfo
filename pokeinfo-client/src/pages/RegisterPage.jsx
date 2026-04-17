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
            setSuccessMessage(result.message || "Account succesvol aangemaakt.");

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
                <h1>Account aanmaken</h1>
                <p>Maak een account aan om je Pokémon-collectie te beheren.</p>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label htmlFor="username">Gebruikersnaam</label>
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
                        <label htmlFor="email">E-mailadres</label>
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
                        <label htmlFor="password">Wachtwoord</label>
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
                        {isSubmitting ? "Bezig met registreren..." : "Account aanmaken"}
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