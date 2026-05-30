namespace PokeInfo.Models.Rankings;

/// <summary>
/// Represents a single user's ranking entry for a specific Pokédex
/// Safe for public display - does not expose private collection details
/// </summary>
public class RankingEntryDto
{
    /// <summary>
    /// The ranking position (1 for first place, 2 for second, etc.)
    /// </summary>
    public int Position { get; set; }

    /// <summary>
    /// The user's display name or username for public display
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// The number of unique Pokémon collected in this Pokédex
    /// </summary>
    public int Collected { get; set; }

    /// <summary>
    /// The total number of Pokémon in this Pokédex
    /// </summary>
    public int Total { get; set; }

    /// <summary>
    /// The completion percentage (0-100)
    /// </summary>
    public int Percentage { get; set; }

    /// <summary>
    /// Whether this user has completed the Pokédex (collected >= total)
    /// </summary>
    public bool IsCompleted { get; set; }

    /// <summary>
    /// The date when the Pokédex was completed, if completed
    /// Null if not completed
    /// </summary>
    public DateTime? CompletionDate { get; set; }
}
