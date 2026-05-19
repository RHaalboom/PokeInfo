import "../styles/pokemonDetail.css";
import { useState, useEffect } from "react";
import { getPokemonByName } from "../services/pokemonService";
import { getCollections, addPokemonToCollection } from "../services/collectionService";
import { isAuthenticated } from "../services/authService";

const formatPokemonName = (name) => {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function PokemonDetail({ pokemon, onClose }) {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [displayedPokemon, setDisplayedPokemon] = useState(pokemon);
    const [collections, setCollections] = useState([]);
    const [selectedCollectionId, setSelectedCollectionId] = useState("");
    const [isAddingToCollection, setIsAddingToCollection] = useState(false);
    const [addMessage, setAddMessage] = useState("");
    const [addError, setAddError] = useState("");

    useEffect(() => {
        if (isAuthenticated()) {
            fetchCollections();
        }
    }, []);

    async function fetchCollections() {
        try {
            const data = await getCollections();
            setCollections(data);
        } catch (err) {
            console.error("Failed to fetch collections:", err);
        }
    }

    async function handleAddToCollection() {
        if (!selectedCollectionId) {
            setAddError("Please select a collection");
            return;
        }

        try {
            setIsAddingToCollection(true);
            setAddError("");
            setAddMessage("");

            await addPokemonToCollection(
                parseInt(selectedCollectionId),
                displayedPokemon.id,
                displayedPokemon.name
            );

            setAddMessage(`${formatPokemonName(displayedPokemon.name)} added to collection!`);
            setSelectedCollectionId("");

            setTimeout(() => {
                setAddMessage("");
            }, 3000);
        } catch (err) {
            setAddError(err.message);
        } finally {
            setIsAddingToCollection(false);
        }
    }

    if (!pokemon) return null;

    const formattedId = `#${displayedPokemon.id.toString().padStart(4, '0')}`;

    const handleVariantClick = async (variant) => {
        try {
            const variantDetails = await getPokemonByName(variant.name);
            setSelectedVariant(variant);
            setDisplayedPokemon(variantDetails);
        } catch (err) {
            console.error("Failed to fetch variant details:", err);
        }
    };

    const handleDefaultClick = () => {
        setSelectedVariant(null);
        setDisplayedPokemon(pokemon);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close-button" onClick={onClose}>
                    x
                </button>

                <img src={displayedPokemon.imageUrl} alt={displayedPokemon.name} />
                <h2>{formatPokemonName(displayedPokemon.name)}</h2>
                <p><strong>ID:</strong> {formattedId}</p>

                {pokemon.variants && pokemon.variants.length > 0 && (
                    <div className="variants-section">
                        <strong>Variants:</strong>
                        <div className="variants-container">
                            <button 
                                className={`variant-btn ${!selectedVariant ? 'active' : ''}`}
                                onClick={handleDefaultClick}
                            >
                                Default
                            </button>
                            {pokemon.variants.map((variant) => (
                                <button
                                    key={variant.name}
                                    className={`variant-btn ${selectedVariant?.name === variant.name ? 'active' : ''}`}
                                    onClick={() => handleVariantClick(variant)}
                                >
                                    {formatPokemonName(variant.name)}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                    <strong>Types:</strong>
                    <ul>
                        {displayedPokemon.types.map((type) => (
                            <li key={type}>{type}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <strong>Abilities:</strong>
                    <ul>
                        {displayedPokemon.abilities.map((ability) => (
                            <li key={ability.id}>{ability.name}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <strong>Games:</strong>
                    <ul>
                        {displayedPokemon.games.map((game) => (
                            <li key={game}>{game}</li>
                        ))}
                    </ul>
                </div>

                {!selectedVariant && displayedPokemon.evolutionChain && displayedPokemon.evolutionChain.stages.length > 1 && (
                    <div>
                        <strong>Evolution Chain:</strong>
                        <div className="evolution-stages">
                            {displayedPokemon.evolutionChain.stages.map((stage, index) => (
                                <div key={stage.pokemonName} className="evolution-stage">
                                    {stage.imageUrl && (
                                        <img src={stage.imageUrl} alt={stage.pokemonName} />
                                    )}
                                    <p>{formatPokemonName(stage.pokemonName)}</p>
                                    {stage.item && stage.item.imageUrl && (
                                        <div className="evolution-item">
                                            <img src={stage.item.imageUrl} alt={stage.item.name} title={formatPokemonName(stage.item.name)} />
                                        </div>
                                    )}
                                    {index < displayedPokemon.evolutionChain.stages.length - 1 && (
                                        <div className="evolution-arrow">→</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isAuthenticated() && collections.length > 0 && (
                    <div className="add-to-collection-section">
                        <strong>Add to Collection:</strong>
                        {addError && <p className="add-error">{addError}</p>}
                        {addMessage && <p className="add-success">{addMessage}</p>}
                        <div className="collection-selector">
                            <select
                                value={selectedCollectionId}
                                onChange={(e) => setSelectedCollectionId(e.target.value)}
                                disabled={isAddingToCollection}
                                className="collection-dropdown"
                            >
                                <option value="">Select a collection...</option>
                                {collections.map((collection) => (
                                    <option key={collection.id} value={collection.id}>
                                        {collection.name}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="add-collection-btn"
                                onClick={handleAddToCollection}
                                disabled={isAddingToCollection || !selectedCollectionId}
                            >
                                {isAddingToCollection ? "Adding..." : "Add to Collection"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}