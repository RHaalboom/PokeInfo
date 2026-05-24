namespace PokeInfo.Models;

public class PokemonListItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int Generation { get; set; }
}