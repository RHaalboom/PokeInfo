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
        throw new Error(data.message || "Registration failed.");
    }

    return data;
}

export async function loginUser(credentials) {
    const response = await fetch(`${AUTH_API_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Login failed.");
    }

    // Store token in localStorage
    if (data.token) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
}

export function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
}

export function getAuthToken() {
    return localStorage.getItem("authToken");
}

export function getCurrentUser() {
    const userJson = localStorage.getItem("user");
    return userJson ? JSON.parse(userJson) : null;
}

export function isAuthenticated() {
    return !!getAuthToken();
}

export async function getAllUsers() {
    const token = getAuthToken();
    const response = await fetch(`${AUTH_API_URL}/users`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to fetch users.");
    }

    return data;
}

export async function banUser(userId) {
    const token = getAuthToken();
    const response = await fetch(`${AUTH_API_URL}/users/${userId}/ban`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to ban user.");
    }

    return data;
}

export async function changeUserRole(userId, roleId) {
    const token = getAuthToken();
    const response = await fetch(`${AUTH_API_URL}/users/${userId}/role/${roleId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to change user role.");
    }

    return data;
}

export async function validateToken() {
    const token = getAuthToken();
    if (!token) {
        throw new Error("No token found.");
    }

    const response = await fetch(`${AUTH_API_URL}/validate-token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Token validation failed.");
    }

    // Update stored user data with fresh data from server
    if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        return data.user;
    }

    throw new Error("No user data in response.");
}
