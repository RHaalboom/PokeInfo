namespace PokeInfo.Models;

public class PokemonDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;

    public List<string> Types { get; set; } = new();
    public List<string> Abilities { get; set; } = new();
    public List<string> Games { get; set; } = new();
}