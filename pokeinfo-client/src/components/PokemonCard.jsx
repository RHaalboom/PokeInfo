import "../styles/colorPalette.css";
import "../styles/pokemonCard.css";

export default function PokemonCard({ pokemon, onSelect }) {
    const capitalizedName = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
    const formattedId = `#${pokemon.id.toString().padStart(4, '0')}`;

    return (
        <article className="pokemon-card" onClick={() => onSelect(pokemon.name)}>
            <h2>{capitalizedName}</h2>
            <img src={pokemon.imageUrl} alt={pokemon.name} />
            <p>{formattedId}</p>
        </article>
    );
}