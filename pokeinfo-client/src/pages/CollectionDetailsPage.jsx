import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCollection, updateCollection, deleteCollection, removePokemonFromCollection } from "../services/collectionService";
import { getPokemonByName } from "../services/pokemonService";
import { isAuthenticated } from "../services/authService";
import PokemonDetail from "../components/PokemonDetail";
import "../styles/collectionDetails.css";

export default function CollectionDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [collection, setCollection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [selectedPokemon, setSelectedPokemon] = useState(null);

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate("/login");
            return;
        }

        fetchCollection();
    }, [id, navigate]);

    async function fetchCollection() {
        try {
            setLoading(true);
            const data = await getCollection(id);
            setCollection(data);
            setEditName(data.name);
            setEditDescription(data.description);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveChanges() {
        if (!editName.trim()) {
            setError("Collection name is required");
            return;
        }

        try {
            setIsSaving(true);
            await updateCollection(id, editName, editDescription);
            setCollection({
                ...collection,
                name: editName,
                description: editDescription
            });
            setIsEditing(false);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleDeleteCollection() {
        if (!window.confirm("Are you sure you want to delete this collection and all its Pokémon?")) {
            return;
        }

        try {
            await deleteCollection(id);
            navigate("/profile");
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleRemovePokemon(pokemonId) {
        if (!window.confirm("Are you sure you want to remove this Pokémon from the collection?")) {
            return;
        }

        try {
            await removePokemonFromCollection(id, pokemonId);
            setCollection({
                ...collection,
                pokemons: collection.pokemons.filter(p => p.pokemonId !== pokemonId)
            });
        } catch (err) {
            setError(err.message);
        }
    }

    async function handleSelectPokemon(pokemonName) {
        try {
            const details = await getPokemonByName(pokemonName);
            setSelectedPokemon(details);
        } catch {
            setError("Fetching Pokémon details failed.");
        }
    }

    function handleCloseDetail() {
        setSelectedPokemon(null);
    }

    if (loading) {
        return <div className="collection-details-loading">Loading collection...</div>;
    }

    if (!collection) {
        return (
            <div className="collection-details-error">
                <p>Collection not found</p>
                <button onClick={() => navigate("/profile")}>Back to Profile</button>
            </div>
        );
    }

    return (
        <main className="collection-details-page">
            <div className="collection-details-container">
                <button className="back-button" onClick={() => navigate("/profile")}>
                    ← Back to Profile
                </button>

                {error && <div className="collection-details-error-message">{error}</div>}

                <div className="collection-details-header">
                    {isEditing ? (
                        <div className="edit-form">
                            <div className="form-group">
                                <label htmlFor="name">Collection Name</label>
                                <input
                                    id="name"
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    disabled={isSaving}
                                    maxLength="100"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    disabled={isSaving}
                                    maxLength="500"
                                    rows="4"
                                />
                            </div>
                            <div className="edit-actions">
                                <button
                                    className="save-button"
                                    onClick={handleSaveChanges}
                                    disabled={isSaving}
                                >
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </button>
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditName(collection.name);
                                        setEditDescription(collection.description);
                                    }}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="collection-info">
                                <h1>{collection.name}</h1>
                                {collection.description && (
                                    <p className="collection-description">{collection.description}</p>
                                )}
                                <div className="collection-stats">
                                    <span className="stat">
                                        <strong>{collection.pokemons.length}</strong> Pokémon
                                    </span>
                                    <span className="stat">
                                        Created: {new Date(collection.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <div className="collection-header-actions">
                                <button
                                    className="edit-button"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="delete-button"
                                    onClick={handleDeleteCollection}
                                >
                                    Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>

                <section className="collection-pokemons-section">
                    <h2>Pokémon in Collection</h2>
                    {collection.pokemons.length === 0 ? (
                        <div className="empty-pokemons">
                            <p>No Pokémon in this collection yet.</p>
                            <p className="hint">Add Pokémon from the Pokémon detail pages.</p>
                        </div>
                    ) : (
                        <div className="pokemons-table">
                            <div className="pokemons-table-header">
                                <div className="table-col-no">Entry</div>
                                <div className="table-col-pic">Img</div>
                                <div className="table-col-name">Name</div>
                                <div className="table-col-added">Added</div>
                                <div className="table-col-action"></div>
                            </div>
                            {collection.pokemons.map((pokemon) => {
                                const capitalizedName = pokemon.pokemonName.charAt(0).toUpperCase() + pokemon.pokemonName.slice(1);
                                const formattedId = `#${pokemon.pokemonId.toString().padStart(4, '0')}`;
                                const addedDate = new Date(pokemon.addedAt).toLocaleDateString();
                                return (
                                    <div key={pokemon.id} className="pokemons-table-row">
                                        <div className="table-col-no">{formattedId}</div>
                                        <div className="table-col-pic">
                                            <img 
                                                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.pokemonId}.png`} 
                                                alt={pokemon.pokemonName}
                                                className="pokemon-sprite"
                                                onClick={() => handleSelectPokemon(pokemon.pokemonName)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                        </div>
                                        <div 
                                            className="table-col-name"
                                            onClick={() => handleSelectPokemon(pokemon.pokemonName)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {capitalizedName}
                                        </div>
                                        <div className="table-col-added">{addedDate}</div>
                                        <div className="table-col-action">
                                            <button
                                                className="remove-pokemon-btn"
                                                onClick={() => handleRemovePokemon(pokemon.pokemonId)}
                                                title="Remove from collection"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {selectedPokemon && (
                <PokemonDetail pokemon={selectedPokemon} onClose={handleCloseDetail} />
            )}
        </main>
    );
}
