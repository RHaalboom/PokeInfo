export default function PokemonCard({ pokemon, onSelect }) {
    return (
        <article className="pokemon-card" onClick={() => onSelect(pokemon.name)}>
            <img src={pokemon.imageUrl} alt={pokemon.name} />
            <h2>{pokemon.name}</h2>
            <p>#{pokemon.id}</p>
        </article>
    );
}