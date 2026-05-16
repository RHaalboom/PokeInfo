namespace PokeInfo.Models.Collections;

public class AddPokemonToCollectionDto
{
    public int PokemonId { get; set; }
    public string PokemonName { get; set; } = string.Empty;
}
