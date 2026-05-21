import "../styles/colorPalette.css";
import "../styles/pokemonDetail.css";
import { useState, useEffect } from "react";
import { getPokemonByName } from "../services/pokemonService";
import { getCollections, addPokemonToCollection } from "../services/collectionService";
import { isAuthenticated } from "../services/authService";
import { getTypeIcon } from "../utils/typeIcons";
import { getSectionIcon } from "../utils/sectionIcons";

const formatPokemonName = (name) => {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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
                className="modal-content pokemon-detail-modal"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close-button" onClick={onClose}>
                    ✕
                </button>

                <div className="pokemon-detail-header">
                    <div className="pokemon-image-container">
                        <img src={displayedPokemon.imageUrl} alt={displayedPokemon.name} className="pokemon-image" />
                    </div>
                    <div className="pokemon-info-section">
                        <h2>{formatPokemonName(displayedPokemon.name)}</h2>
                        <p className="pokemon-id">ID: {formattedId}</p>

                        {/* Types Section */}
                        <div className="detail-section">
                            <div className="section-header">
                                <img src={getSectionIcon('typing')} alt="Types" className="section-icon" />
                                <h3>Types</h3>
                            </div>
                            <div className="types-container">
                                {displayedPokemon.types.map((type) => {
                                    const iconSrc = getTypeIcon(type);
                                    return (
                                        <span key={type} className={`type-badge type-${type.toLowerCase()}`}>
                                            <img src={iconSrc} alt={type} className="type-icon" />
                                            {capitalize(type)}
                                        </span>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Abilities Section */}
                        <div className="detail-section">
                            <div className="section-header">
                                <img src={getSectionIcon('ability')} alt="Abilities" className="section-icon" />
                                <h3>Abilities</h3>
                            </div>
                            <div className="abilities-container">
                                {displayedPokemon.abilities.map((ability) => (
                                    <span key={ability.id} className="ability-badge">
                                        {capitalize(ability.name)}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Games Section */}
                <div className="detail-section">
                    <div className="section-header">
                        <img src={getSectionIcon('games')} alt="Games" className="section-icon" />
                        <h3>Games</h3>
                    </div>
                    <div className="games-container">
                        {displayedPokemon.games.map((game) => (
                            <span key={game} className="game-badge">
                                {capitalize(game)}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Evolution Chain */}
                {!selectedVariant && displayedPokemon.evolutionChain && displayedPokemon.evolutionChain.stages.length > 1 && (
                    <div className="detail-section">
                        <div className="section-header">
                            <img src={getSectionIcon('evolutionChain')} alt="Evolution Chain" className="section-icon" />
                            <h3>Evolution Chain</h3>
                        </div>
                        <div className="evolution-chain-container">
                            {displayedPokemon.evolutionChain.stages.map((stage, index) => (
                                <div key={stage.pokemonName} className="evolution-stage-wrapper">
                                    <div className="evolution-stage-detail">
                                        {stage.imageUrl && (
                                            <img src={stage.imageUrl} alt={stage.pokemonName} className="evolution-image" />
                                        )}
                                        <div className="evolution-info-text">
                                            <p className="evolution-name">{formatPokemonName(stage.pokemonName)}</p>
                                            <p className="evolution-id">#{stage.pokemonName === displayedPokemon.name ? displayedPokemon.id : ''}</p>
                                        </div>
                                        <div className="evolution-types">
                                            {displayedPokemon.types.map((type) => (
                                                <span key={type} className={`evolution-type ${type.toLowerCase()}`}>
                                                    {capitalize(type)}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
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
                                {isAddingToCollection ? "Adding..." : "Add"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}