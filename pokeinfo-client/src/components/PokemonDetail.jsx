import "../styles/colorPalette.css";
import "../styles/pokemonDetail.css";
import { useState, useEffect } from "react";
import { getPokemonByName } from "../services/pokemonService";
import { getCollections, addPokemonToCollection } from "../services/collectionService";
import { isAuthenticated } from "../services/authService";
import { getTypeIcon } from "../utils/typeIcons";
import { getSectionIcon } from "../utils/sectionIcons";
import { getGameIcon, formatGameName, getGameClass } from "../utils/gameIcons";

const formatPokemonName = (name) => {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const getVariantLabel = (variantName, basePokemonName) => {
    // Remove the base pokemon name from the variant name to show only the unique part
    const lowerVariant = variantName.toLowerCase();
    const lowerBase = basePokemonName.toLowerCase();

    // Check if the variant contains the base name
    if (lowerVariant.includes(lowerBase)) {
        // Remove the base name and any extra hyphens
        let label = lowerVariant.replace(lowerBase, '').replace(/^-+|-+$/g, '');
        return label ? capitalize(label) : 'Default';
    }

    return formatPokemonName(variantName);
};

export default function PokemonDetail({ pokemon, onClose }) {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [displayedPokemon, setDisplayedPokemon] = useState(pokemon);
    const [basePokemonName] = useState(pokemon.name); // Store the original base name
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

    useEffect(() => {
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';

        return () => {
            // Re-enable body scroll when modal closes
            document.body.style.overflow = 'unset';
        };
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
                data-cy="pokemon-detail-modal"
            >
                <button className="close-button" onClick={onClose} data-cy="back-button">
                    ✕
                </button>

                <div className="pokemon-detail-header">
                    <div className="pokemon-name-id-container">
                        <h2>{formatPokemonName(displayedPokemon.name)}</h2>
                        <p className="pokemon-id">{formattedId}</p>
                    </div>
                    <div className="pokemon-image-container">
                        <img src={displayedPokemon.imageUrl} alt={displayedPokemon.name} className="pokemon-image" />
                    </div>
                    <div className="pokemon-info-section">
                        <div className="pokemon-info-header">
                            <h2>{formatPokemonName(displayedPokemon.name)}</h2>
                        </div>

                        {/* ID and Variants Row */}
                        <div className="id-variants-row">
                            <p className="pokemon-id">{formattedId}</p>
                            {displayedPokemon.variants && displayedPokemon.variants.length > 0 && (
                                <div className="variants-section">
                                    <div className="variants-container">
                                        {displayedPokemon.variants.map((variant) => (
                                            <button
                                                key={variant.name}
                                                className={`variant-btn ${selectedVariant?.name === variant.name ? 'active' : ''}`}
                                                onClick={() => {
                                                    // If clicking the same variant, toggle back to default
                                                    if (selectedVariant?.name === variant.name) {
                                                        handleDefaultClick();
                                                    } else {
                                                        handleVariantClick(variant);
                                                    }
                                                }}
                                            >
                                                {getVariantLabel(variant.name, basePokemonName)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Types and Abilities Block */}
                        <div className="detail-section">
                            {/* Types Section */}
                            <div className="subsection">
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
                            <div className="subsection">
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
                </div>

                {/* Strengths and Weaknesses Section */}
                {displayedPokemon.typeEffectiveness && (
                    <div className="detail-section">
                        <div className="strengths-weaknesses-container">
                            {displayedPokemon.typeEffectiveness.strengths.length > 0 && (
                                <div className="subsection">
                                    <div className="section-header">
                                        <img src={getSectionIcon('strength')} alt="Strengths" className="section-icon" />
                                        <h3>Strengths</h3>
                                    </div>
                                    <div className="strengths-weaknesses-types">
                                        {displayedPokemon.typeEffectiveness.strengths.map((type) => {
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
                            )}
                            {displayedPokemon.typeEffectiveness.weaknesses.length > 0 && (
                                <div className="subsection">
                                    <div className="section-header">
                                        <img src={getSectionIcon('weakness')} alt="Weaknesses" className="section-icon" />
                                        <h3>Weaknesses</h3>
                                    </div>
                                    <div className="strengths-weaknesses-types">
                                        {displayedPokemon.typeEffectiveness.superEffective && displayedPokemon.typeEffectiveness.superEffective.length > 0 && (
                                            <>
                                                {displayedPokemon.typeEffectiveness.superEffective.map((type) => {
                                                    const iconSrc = getTypeIcon(type);
                                                    return (
                                                        <span key={type} className={`type-badge type-${type.toLowerCase()} super-weak-badge`} title="4x weak">
                                                            <img src={iconSrc} alt={type} className="type-icon" />
                                                            {capitalize(type)}
                                                            <span className="weakness-multiplier">4x</span>
                                                        </span>
                                                    );
                                                })}
                                            </>
                                        )}
                                        {displayedPokemon.typeEffectiveness.weaknesses
                                            .filter(type => !displayedPokemon.typeEffectiveness.superEffective || !displayedPokemon.typeEffectiveness.superEffective.includes(type))
                                            .map((type) => {
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
                            )}
                        </div>
                    </div>
                )}

                {/* Games Section */}
                <div className="detail-section">
                    <div className="section-header">
                        <img src={getSectionIcon('games')} alt="Games" className="section-icon" />
                        <h3>Games</h3>
                    </div>
                    <div className="games-container">
                        {displayedPokemon.games.map((game) => {
                            const iconSrc = getGameIcon(game);
                            const formattedGameName = formatGameName(game);
                            const gameClass = getGameClass(game);
                            return (
                                <span key={game} className={`game-badge ${gameClass}`}>
                                    {iconSrc && <img src={iconSrc} alt={formattedGameName} className="game-icon-img" />}
                                    {formattedGameName}
                                </span>
                            );
                        })}
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
                                        </div>
                                        <div className="evolution-types">
                                            {stage.types.map((type) => (
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