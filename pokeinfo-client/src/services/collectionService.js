import { getAuthToken } from "./authService";

const API_BASE_URL = "https://localhost:7024/api/collections";

function getHeaders() {
    const token = getAuthToken();
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

export async function getCollections() {
    const response = await fetch(API_BASE_URL, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error("Couldn't fetch collections.");
    }

    return await response.json();
}

export async function getCollection(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "GET",
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error("Couldn't fetch collection.");
    }

    return await response.json();
}

export async function createCollection(name, description) {
    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ name, description })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Couldn't create collection.");
    }

    return data;
}

export async function updateCollection(id, name, description) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ name, description })
    });

    if (!response.ok) {
        throw new Error("Couldn't update collection.");
    }

    return await response.json();
}

export async function deleteCollection(id) {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error("Couldn't delete collection.");
    }
}

export async function addPokemonToCollection(collectionId, pokemonId, pokemonName, caughtInGame = null) {
    const response = await fetch(`${API_BASE_URL}/${collectionId}/pokemon`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ pokemonId, pokemonName, caughtInGame })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Couldn't add Pokémon to collection.");
    }

    return data;
}

export async function updatePokemonGame(collectionId, pokemonId, game) {
    const response = await fetch(`${API_BASE_URL}/${collectionId}/pokemon/${pokemonId}/game`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ game })
    });

    if (!response.ok) {
        throw new Error("Couldn't update Pokémon game.");
    }
}

export async function removePokemonFromCollection(collectionId, pokemonId) {
    const response = await fetch(`${API_BASE_URL}/${collectionId}/pokemon/${pokemonId}`, {
        method: "DELETE",
        headers: getHeaders()
    });

    if (!response.ok) {
        throw new Error("Couldn't remove Pokémon from collection.");
    }
}
