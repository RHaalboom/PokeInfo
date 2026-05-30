namespace PokeInfo.Models.Rankings;

/// <summary>
/// Represents the complete ranking for a specific Pokédex region
/// </summary>
public class PokedexRankingDto
{
    /// <summary>
    /// The Pokédex region key (e.g., "KANTO", "JOHTO")
    /// </summary>
    public string PokedexKey { get; set; } = string.Empty;

    /// <summary>
    /// The display name of the region (e.g., "Kanto", "Johto")
    /// </summary>
    public string PokedexName { get; set; } = string.Empty;

    /// <summary>
    /// Total number of Pokémon in this Pokédex
    /// </summary>
    public int TotalPokemon { get; set; }

    /// <summary>
    /// List of ranked entries for this Pokédex, sorted according to business rules
    /// </summary>
    public List<RankingEntryDto> Rankings { get; set; } = new();
}
