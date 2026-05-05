import "../styles/pokemonDetail.css";
import { useState } from "react";
import { getPokemonByName } from "../services/pokemonService";

const formatPokemonName = (name) => {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

export default function PokemonDetail({ pokemon, onClose }) {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [displayedPokemon, setDisplayedPokemon] = useState(pokemon);

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
            </div>
        </div>
    );
}