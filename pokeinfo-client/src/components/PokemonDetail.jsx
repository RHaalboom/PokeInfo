import "../styles/pokemonDetail.css";

export default function PokemonDetail({ pokemon, onClose }) {
    if (!pokemon) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="close-button" onClick={onClose}>
                    x
                </button>

                <img src={pokemon.imageUrl} alt={pokemon.name} />
                <h2>{pokemon.name}</h2>
                <p><strong>ID:</strong> {pokemon.id}</p>

                <div>
                    <strong>Types:</strong>
                    <ul>
                        {pokemon.types.map((type) => (
                            <li key={type}>{type}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <strong>Abilities:</strong>
                    <ul>
                        {pokemon.abilities.map((ability) => (
                            <li key={ability.id}>{ability.name}</li>
                        ))}
                    </ul>
                </div>

                <div>
                    <strong>Games:</strong>
                    <ul>
                        {pokemon.games.map((game) => (
                            <li key={game}>{game}</li>
                        ))}
                    </ul>
                </div>

                {pokemon.evolutionChain && pokemon.evolutionChain.stages.length > 0 && (
                    <div>
                        <strong>Evolution Chain:</strong>
                        <div className="evolution-stages">
                            {pokemon.evolutionChain.stages.map((stage, index) => (
                                <div key={stage.pokemonName} className="evolution-stage">
                                    {stage.imageUrl && (
                                        <img src={stage.imageUrl} alt={stage.pokemonName} />
                                    )}
                                    <p>{stage.pokemonName}</p>
                                    {stage.minLevel && <p className="evolution-info">Level {stage.minLevel}</p>}
                                    {stage.triggerName && <p className="evolution-info">{stage.triggerName}</p>}
                                    {stage.itemName && <p className="evolution-info">Item: {stage.itemName}</p>}
                                    {index < pokemon.evolutionChain.stages.length - 1 && (
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