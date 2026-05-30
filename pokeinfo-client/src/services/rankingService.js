import { getAuthToken } from "./authService";

const API_BASE_URL = "https://localhost:7024/api/rankings";

function getHeaders() {
    const token = getAuthToken();
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
    };
}

/**
 * Get the ranking for a specific Pokédex region
 * @param {string} pokedexKey - The Pokédex region key (e.g., "KANTO")
 * @returns {Promise<Object>} The ranking DTO for the specified Pokédex
 */
export async function getPokedexRanking(pokedexKey) {
    try {
        console.log(`Fetching rankings for ${pokedexKey}, token present: ${!!getAuthToken()}`);

        const response = await fetch(`${API_BASE_URL}/pokedex/${pokedexKey}`, {
            method: "GET",
            headers: getHeaders()
        });

        console.log(`Rankings API response status: ${response.status}`);

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`API Error ${response.status}: ${errorData}`);
            console.error(`Response headers:`, {
                'content-type': response.headers.get('content-type'),
                'www-authenticate': response.headers.get('www-authenticate')
            });
            throw new Error(errorData || `API returned status ${response.status}`);
        }

        const data = await response.json();
        console.log(`Successfully fetched rankings for ${pokedexKey}:`, data);
        return data;
    } catch (error) {
        console.error('Error in getPokedexRanking:', error);
        throw error;
    }
}

/**
 * Get rankings overview for all Pokédex regions
 * @returns {Promise<Array>} List of rankings for all Pokédex regions
 */
export async function getAllRankings() {
    try {
        const response = await fetch(`${API_BASE_URL}/overview`, {
            method: "GET",
            headers: getHeaders()
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error(`API Error: ${response.status}`, errorData);
            throw new Error(errorData || `API returned status ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error in getAllRankings:', error);
        throw error;
    }
}
