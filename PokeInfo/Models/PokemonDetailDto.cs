namespace PokeInfo.Models;

public class PokemonDetailDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;

    public List<string> Types { get; set; } = new();
    public List<AbilityDto> Abilities { get; set; } = new();
    public List<string> Games { get; set; } = new();
    public List<PokemonVariantDto> Variants { get; set; } = new();

    public EvolutionChainDto? EvolutionChain { get; set; }
}

public class AbilityDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ShortEffect { get; set; } = string.Empty;
    public string Effect { get; set; } = string.Empty;
}

public class ItemDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}

public class PokemonVariantDto
{
    public string Name { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
}

public class PokemonSpeciesDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string EvolutionChainUrl { get; set; } = string.Empty;
    public List<PokemonVariantDto> Variants { get; set; } = new();
}
public class EvolutionChainDto
{
    public int Id { get; set; }

    public List<EvolutionStageDto> Stages { get; set; } = new();
}
public class EvolutionStageDto
{
    public string PokemonName { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public int? MinLevel { get; set; }
    public string? TriggerName { get; set; }
    public ItemDto? Item { get; set; }
}