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
                            <li key={ability}>{ability}</li>
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
            </div>
        </div>
    );
}