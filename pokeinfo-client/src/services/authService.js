const AUTH_API_URL = "https://localhost:7024/api/auth";

export async function registerUser(registerData) {
    const response = await fetch(`${AUTH_API_URL}/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(registerData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Registreren is mislukt.");
    }

    return data;
}