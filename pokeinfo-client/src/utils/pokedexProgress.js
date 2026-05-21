// Pokédex information
export const POKEDEX_DATA = {
    KANTO: { name: 'Kanto', totalPokemon: 151 },
    JOHTO: { name: 'Johto', totalPokemon: 100 },
    HOENN: { name: 'Hoenn', totalPokemon: 135 },
    SINNOH: { name: 'Sinnoh', totalPokemon: 107 },
    UNOVA: { name: 'Unova', totalPokemon: 156 },
    KALOS: { name: 'Kalos', totalPokemon: 72 },
    ALOLA: { name: 'Alola', totalPokemon: 81 },
    GALAR: { name: 'Galar', totalPokemon: 81 },
    HISUI: { name: 'Hisui', totalPokemon: 242 },
    PALDEA: { name: 'Paldea', totalPokemon: 103 }
};

// Mapping from game titles to regional Pokédex
export const GAME_TO_POKEDEX = {
    // Kanto region
    'red': 'KANTO',
    'blue': 'KANTO',
    'yellow': 'KANTO',
    'green': 'KANTO',
    'firered': 'KANTO',
    'leafgreen': 'KANTO',

    // Johto region
    'gold': 'JOHTO',
    'silver': 'JOHTO',
    'crystal': 'JOHTO',
    'heartgold': 'JOHTO',
    'soulsilver': 'JOHTO',

    // Hoenn region
    'ruby': 'HOENN',
    'sapphire': 'HOENN',
    'emerald': 'HOENN',

    // Sinnoh region
    'diamond': 'SINNOH',
    'pearl': 'SINNOH',
    'platinum': 'SINNOH',

    // Unova region
    'black': 'UNOVA',
    'white': 'UNOVA',
    'black-2': 'UNOVA',
    'white-2': 'UNOVA',
    'black 2': 'UNOVA',
    'white 2': 'UNOVA',

    // Kalos region
    'x': 'KALOS',
    'y': 'KALOS',

    // Alola region
    'sun': 'ALOLA',
    'moon': 'ALOLA',
    'ultrasun': 'ALOLA',
    'ultramoon': 'ALOLA',
    'ultra sun': 'ALOLA',
    'ultra moon': 'ALOLA',

    // Galar region
    'sword': 'GALAR',
    'shield': 'GALAR',

    // Hisui region
    'legends': 'HISUI',
    'legends: arceus': 'HISUI',
    'legends arceus': 'HISUI',

    // Paldea region
    'scarlet': 'PALDEA',
    'violet': 'PALDEA'
};

/**
 * Calculate Pokédex completion percentages from user's collections
 * @param {Array} collections - Array of collection objects with pokemons
 * @returns {Object} Object with Pokédex names as keys and completion percentages as values
 */
export function calculatePokedexProgress(collections) {
    // Count unique Pokémon caught in each Pokédex across all collections
    const caughtInPokedex = {
        KANTO: new Set(),
        JOHTO: new Set(),
        HOENN: new Set(),
        SINNOH: new Set(),
        UNOVA: new Set(),
        KALOS: new Set(),
        ALOLA: new Set(),
        GALAR: new Set(),
        HISUI: new Set(),
        PALDEA: new Set()
    };

    // Iterate through all collections and track caught Pokémon
    if (collections && Array.isArray(collections)) {
        collections.forEach(collection => {
            if (collection.pokemons && Array.isArray(collection.pokemons)) {
                collection.pokemons.forEach(pokemon => {
                    const gameName = pokemon.caughtInGame?.toLowerCase();
                    if (gameName) {
                        // Map game name to Pokédex
                        const pokedex = GAME_TO_POKEDEX[gameName];
                        if (pokedex && caughtInPokedex[pokedex]) {
                            caughtInPokedex[pokedex].add(pokemon.pokemonId);
                        }
                    }
                });
            }
        });
    }

    // Calculate percentages
    const percentages = {};
    Object.keys(POKEDEX_DATA).forEach(key => {
        const caught = caughtInPokedex[key].size;
        const total = POKEDEX_DATA[key].totalPokemon;
        percentages[key] = total > 0 ? Math.round((caught / total) * 100) : 0;
    });

    return percentages;
}

/**
 * Get progress data for a single Pokédex
 * @param {string} pokedexKey - The Pokédex key (e.g., 'KANTO')
 * @param {number} percentage - The completion percentage
 * @returns {Object} Progress data object
 */
export function getPokedexProgressData(pokedexKey, percentage) {
    return {
        name: POKEDEX_DATA[pokedexKey]?.name || pokedexKey,
        key: pokedexKey,
        percentage: Math.min(100, Math.max(0, percentage)),
        total: POKEDEX_DATA[pokedexKey]?.totalPokemon || 0
    };
}
