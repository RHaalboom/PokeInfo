const API_BASE_URL = "https://localhost:7024/api/pokemon";

export async function getPokemonOverview() {
    const response = await fetch(API_BASE_URL);

    if (!response.ok) {
        throw new Error("Kon Pokémon-overzicht niet ophalen.");
    }

    return await response.json();
}

export async function getPokemonByName(name) {
    const response = await fetch(`${API_BASE_URL}/${name}`);

    if (!response.ok) {
        throw new Error("Kon Pokémon-details niet ophalen.");
    }

    return await response.json();
}