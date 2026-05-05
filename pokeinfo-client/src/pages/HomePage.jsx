import { useEffect, useState } from "react";
import { getPokemonOverview, getPokemonByName } from "../services/pokemonService";
import PokemonCard from "../components/PokemonCard";
import PokemonDetail from "../components/PokemonDetail";
import "../styles/home.css";
import "../styles/pokemonCard.css";
import "../styles/pokemonDetail.css";

export default function HomePage() {
    const [pokemon, setPokemon] = useState([]);
    const [filteredPokemon, setFilteredPokemon] = useState([]);
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadPokemon();
    }, []);

    useEffect(() => {
        const filtered = pokemon.filter((p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredPokemon(filtered);
    }, [searchTerm, pokemon]);

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
        } catch (err) {
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
        } catch (err) {
            setError("Fetching details failed.");
        } finally {
            setDetailLoading(false);
        }
    }

    function handleCloseDetail() {
        setSelectedPokemon(null);
    }

    return (
        <main className="home-page">
            <section className="hero">
                <h1>Poké-info</h1>
                <p>
                    A cental place for your Pokémon-information and maintaining your own collection!
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
                />
            </section>

            {loading && <p>Loading...</p>}
            {error && <p className="error-message">{error}</p>}
            {detailLoading && <p>Loading...</p>}

            {!loading && !error && (
                <section className="pokemon-grid">
                    {filteredPokemon.map((pokemon) => (
                        <PokemonCard
                            key={pokemon.id}
                            pokemon={pokemon}
                            onSelect={handleSelectPokemon}
                        />
                    ))}
                </section>
            )}

            {selectedPokemon && (
                <PokemonDetail pokemon={selectedPokemon} onClose={handleCloseDetail} />
            )}
        </main>
    );
}