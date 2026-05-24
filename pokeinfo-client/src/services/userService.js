import { getAuthToken } from "./authService";

const API_BASE_URL = "https://localhost:7024/api/auth";

function getHeaders() {
    const token = getAuthToken();
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

export async function updateProfile(displayName, profilePictureUrl, threedsFC, switchFC, showRankings) {
    const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ displayName, profilePictureUrl, threedsFC, switchFC, showRankings })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Couldn't update profile.");
    }

    return data;
}

export async function changePassword(currentPassword, newPassword, confirmPassword) {
    const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Couldn't change password.");
    }

    return data;
}

export async function updateAccount(username, email, currentPassword) {
    const response = await fetch(`${API_BASE_URL}/update-account`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ username, email, currentPassword })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Couldn't update account.");
    }

    return data;
}
