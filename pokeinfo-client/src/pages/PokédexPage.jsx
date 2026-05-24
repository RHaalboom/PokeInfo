import { useEffect, useState } from "react";
import { getPokemonOverview, getPokemonByName } from "../services/pokemonService";
import PokemonCard from "../components/PokemonCard";
import PokemonDetail from "../components/PokemonDetail";
import filterIcon from "../img/Poké-info_filter.png";
import "../styles/colorPalette.css";
import "../styles/home.css";
import "../styles/pokemonCard.css";
import "../styles/pokemonDetail.css";

const POKEMON_TYPES = [
    "Normal", "Fire", "Fighting", "Water", "Flying", "Grass",
    "Poison", "Electric", "Ground", "Psychic", "Rock", "Ice",
    "Bug", "Dragon", "Ghost", "Dark", "Steel", "Fairy", "Stellar", "???"
];

const TYPE_COLORS = {
    "Normal": "#A8A878",
    "Fire": "#F08030",
    "Fighting": "#C03028",
    "Water": "#6890F0",
    "Flying": "#A890F0",
    "Grass": "#78C850",
    "Poison": "#A040A0",
    "Electric": "#F8D030",
    "Ground": "#E0C068",
    "Psychic": "#F85888",
    "Rock": "#B8A038",
    "Ice": "#98D8D8",
    "Bug": "#A8B820",
    "Dragon": "#7038F8",
    "Ghost": "#705898",
    "Dark": "#705848",
    "Steel": "#B8B8D0",
    "Fairy": "#EE99AC",
    "Stellar": "#A8A8A8",
    "???": "#68A090"
};

const ROMAN_NUMERALS = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
    6: "VI",
    7: "VII",
    8: "VIII",
    9: "IX"
};

export default function PokédexPage() {
    const [pokemon, setPokemon] = useState([]);
    const [filteredPokemon, setFilteredPokemon] = useState([]);
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGeneration, setSelectedGeneration] = useState(0);
    const [filterOpen, setFilterOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadPokemon();
    }, []);

    useEffect(() => {
        const filtered = pokemon.filter((p) => {
            const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesGeneration = selectedGeneration === 0 || p.generation === selectedGeneration;
            return matchesSearch && matchesGeneration;
        });
        setFilteredPokemon(filtered);
    }, [searchTerm, selectedGeneration, pokemon]);

    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === "Escape") {
                setSelectedPokemon(null);
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    async function loadPokemon() {
        try {
            setLoading(true);
            setError("");
            const data = await getPokemonOverview();
            setPokemon(data);
            setFilteredPokemon(data);
        } catch {
            setError("Fetching Pokémon failed.");
        } finally {
            setLoading(false);
        }
    }

    async function handleSelectPokemon(name) {
        try {
            setDetailLoading(true);
            const details = await getPokemonByName(name);
            setSelectedPokemon(details);
        } catch {
            setError("Fetching details failed.");
        } finally {
            setDetailLoading(false);
        }
    }

    function handleCloseDetail() {
        setSelectedPokemon(null);
    }

    // Helper function to get generation info
    const getGenerationInfo = (gen) => {
        const genInfo = {
            1: { name: "Generation I", games: "Red/Blue/Yellow", color: "#FF6B6B" },
            2: { name: "Generation II", games: "Gold/Silver/Crystal", color: "#FFD93D" },
            3: { name: "Generation III", games: "Ruby/Sapphire/Emerald", color: "#6BCB77" },
            4: { name: "Generation IV", games: "Diamond/Pearl/Platinum", color: "#4D96FF" },
            5: { name: "Generation V", games: "Black/White", color: "#9D4EDD" },
            6: { name: "Generation VI", games: "X/Y", color: "#FF006E" },
            7: { name: "Generation VII", games: "Sun/Moon/Ultra", color: "#FB5607" },
            8: { name: "Generation VIII", games: "Sword/Shield", color: "#FFBE0B" },
            9: { name: "Generation IX", games: "Scarlet/Violet", color: "#8338EC" },
        };
        return genInfo[gen] || { name: "Unknown", games: "", color: "#999999" };
    };

    // Group filtered Pokémon by generation
    const groupedByGeneration = () => {
        const grouped = {};
        filteredPokemon.forEach((p) => {
            if (!grouped[p.generation]) {
                grouped[p.generation] = [];
            }
            grouped[p.generation].push(p);
        });
        return grouped;
    };

    return (
        <main className="home-page">
            <section className="hero">
                <h1>Pokédex</h1>
                <p>
                    Browse and explore all Pokémon with detailed information.
                </p>
            </section>

            <section className="search-section">
                <label htmlFor="pokemonSearch" className="sr-only">
                    Search for a Pokémon
                </label>
                <input
                    id="pokemonSearch"
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    data-cy="pokemon-search"
                />
                <button 
                    className="filter-button"
                    onClick={() => setFilterOpen(!filterOpen)}
                    title="Toggle filters"
                    data-cy="pokemon-filter-button"
                >
                    <img src={filterIcon} alt="Filter" />
                </button>
            </section>

            {filterOpen && (
                <section className="filter-panel" data-cy="pokemon-filter-panel">
                    <div className="filter-content">
                        {/* Generation filters */}
                        <div className="filter-section-left">
                            <h3>Generations</h3>
                            <div className="gen-grid">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => (
                                    <button
                                        key={gen}
                                        className={`gen-button ${selectedGeneration === gen ? "active" : ""}`}
                                        onClick={() => setSelectedGeneration(selectedGeneration === gen ? 0 : gen)}
                                        style={{
                                            borderColor: getGenerationInfo(gen).color,
                                            color: selectedGeneration === gen ? "white" : getGenerationInfo(gen).color,
                                            backgroundColor: selectedGeneration === gen ? getGenerationInfo(gen).color : "transparent",
                                        }}
                                    >
                                        {ROMAN_NUMERALS[gen]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {detailLoading && <p>Loading...</p>}

            {!loading && !error && (
                <>
                    {selectedGeneration === 0 ? (
                        // Show all generations grouped
                        <div className="generations-container" data-cy="pokemon-generations-container">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((gen) => {
                                const pokemonInGen = groupedByGeneration()[gen] || [];
                                if (pokemonInGen.length === 0) return null;
                                const genInfo = getGenerationInfo(gen);
                                return (
                                    <section key={gen} className="generation-section">
                                        <div 
                                            className="generation-header"
                                            style={{ borderColor: genInfo.color }}
                                        >
                                            <div className="generation-header-content">
                                                <span className="generation-title" style={{ color: genInfo.color }}>
                                                    {genInfo.name} - {genInfo.games}
                                                </span>
                                                <span className="pokemon-count">
                                                    {pokemonInGen.length} Pokémon
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pokemon-grid" data-cy="pokemon-overview">
                                            {pokemonInGen.map((pokemon) => (
                                                <PokemonCard
                                                    key={pokemon.id}
                                                    pokemon={pokemon}
                                                    onSelect={handleSelectPokemon}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                );
                            })}
                        </div>
                    ) : (
                        // Show single generation with header
                        <section className="generation-section">
                            {(() => {
                                const genInfo = getGenerationInfo(selectedGeneration);
                                return (
                                    <>
                                        <div 
                                            className="generation-header"
                                            style={{ borderColor: genInfo.color }}
                                        >
                                            <div className="generation-header-content">
                                                <span className="generation-title" style={{ color: genInfo.color }}>
                                                    {genInfo.name} - {genInfo.games}
                                                </span>
                                                <span className="pokemon-count">
                                                    {filteredPokemon.length} Pokémon
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pokemon-grid" data-cy="pokemon-overview">
                                            {filteredPokemon.map((pokemon) => (
                                                <PokemonCard
                                                    key={pokemon.id}
                                                    pokemon={pokemon}
                                                    onSelect={handleSelectPokemon}
                                                />
                                            ))}
                                        </div>
                                    </>
                                );
                            })()}
                        </section>
                    )}
                </>
            )}

            {selectedPokemon && (
                <PokemonDetail pokemon={selectedPokemon} onClose={handleCloseDetail} />
            )}
        </main>
    );
}
