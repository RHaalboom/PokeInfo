using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokeInfo.Entities;

public class CollectionPokemon
{
    public int Id { get; set; }

    public int CollectionId { get; set; }

    [ForeignKey(nameof(CollectionId))]
    public Collection Collection { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string PokemonName { get; set; } = string.Empty;

    public int PokemonId { get; set; }

    [MaxLength(100)]
    public string? CaughtInGame { get; set; }

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
