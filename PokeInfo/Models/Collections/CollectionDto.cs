namespace PokeInfo.Models.Collections;

public class CollectionDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<CollectionPokemonDto> Pokemons { get; set; } = new();
}

public class CollectionPokemonDto
{
    public int Id { get; set; }
    public int PokemonId { get; set; }
    public string PokemonName { get; set; } = string.Empty;
    public string? CaughtInGame { get; set; }
    public DateTime AddedAt { get; set; }
}
