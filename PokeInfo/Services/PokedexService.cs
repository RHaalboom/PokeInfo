namespace PokeInfo.Services;

/// <summary>
/// Service providing Pokédex definitions, game mappings, and regional data
/// </summary>
public class PokedexService
{
    /// <summary>
    /// Pokédex region definitions with keys and total Pokémon counts
    /// </summary>
    public static class Pokedexes
    {
        public const string Kanto = "KANTO";
        public const string Johto = "JOHTO";
        public const string Hoenn = "HOENN";
        public const string Sinnoh = "SINNOH";
        public const string Unova = "UNOVA";
        public const string Kalos = "KALOS";
        public const string Alola = "ALOLA";
        public const string Galar = "GALAR";
        public const string Hisui = "HISUI";
        public const string Paldea = "PALDEA";
    }

    /// <summary>
    /// Pokédex region information (key, display name, total Pokémon)
    /// </summary>
    public static readonly Dictionary<string, PokedexRegion> Regions = new()
    {
        { Pokedexes.Kanto, new PokedexRegion { Key = Pokedexes.Kanto, Name = "Kanto", TotalPokemon = 151 } },
        { Pokedexes.Johto, new PokedexRegion { Key = Pokedexes.Johto, Name = "Johto", TotalPokemon = 100 } },
        { Pokedexes.Hoenn, new PokedexRegion { Key = Pokedexes.Hoenn, Name = "Hoenn", TotalPokemon = 135 } },
        { Pokedexes.Sinnoh, new PokedexRegion { Key = Pokedexes.Sinnoh, Name = "Sinnoh", TotalPokemon = 107 } },
        { Pokedexes.Unova, new PokedexRegion { Key = Pokedexes.Unova, Name = "Unova", TotalPokemon = 156 } },
        { Pokedexes.Kalos, new PokedexRegion { Key = Pokedexes.Kalos, Name = "Kalos", TotalPokemon = 72 } },
        { Pokedexes.Alola, new PokedexRegion { Key = Pokedexes.Alola, Name = "Alola", TotalPokemon = 81 } },
        { Pokedexes.Galar, new PokedexRegion { Key = Pokedexes.Galar, Name = "Galar", TotalPokemon = 81 } },
        { Pokedexes.Hisui, new PokedexRegion { Key = Pokedexes.Hisui, Name = "Hisui", TotalPokemon = 242 } },
        { Pokedexes.Paldea, new PokedexRegion { Key = Pokedexes.Paldea, Name = "Paldea", TotalPokemon = 103 } }
    };

    /// <summary>
    /// Mapping from game names to Pokédex keys (case-insensitive)
    /// </summary>
    private static readonly Dictionary<string, string> GameToPokedexMap = new(StringComparer.OrdinalIgnoreCase)
    {
        // Kanto region
        { "red", Pokedexes.Kanto },
        { "blue", Pokedexes.Kanto },
        { "yellow", Pokedexes.Kanto },
        { "green", Pokedexes.Kanto },
        { "firered", Pokedexes.Kanto },
        { "leafgreen", Pokedexes.Kanto },

        // Johto region
        { "gold", Pokedexes.Johto },
        { "silver", Pokedexes.Johto },
        { "crystal", Pokedexes.Johto },
        { "heartgold", Pokedexes.Johto },
        { "soulsilver", Pokedexes.Johto },

        // Hoenn region
        { "ruby", Pokedexes.Hoenn },
        { "sapphire", Pokedexes.Hoenn },
        { "emerald", Pokedexes.Hoenn },

        // Sinnoh region
        { "diamond", Pokedexes.Sinnoh },
        { "pearl", Pokedexes.Sinnoh },
        { "platinum", Pokedexes.Sinnoh },

        // Unova region
        { "black", Pokedexes.Unova },
        { "white", Pokedexes.Unova },
        { "black-2", Pokedexes.Unova },
        { "white-2", Pokedexes.Unova },
        { "black 2", Pokedexes.Unova },
        { "white 2", Pokedexes.Unova },

        // Kalos region
        { "x", Pokedexes.Kalos },
        { "y", Pokedexes.Kalos },

        // Alola region
        { "sun", Pokedexes.Alola },
        { "moon", Pokedexes.Alola },
        { "ultrasun", Pokedexes.Alola },
        { "ultramoon", Pokedexes.Alola },
        { "ultra sun", Pokedexes.Alola },
        { "ultra moon", Pokedexes.Alola },

        // Galar region
        { "sword", Pokedexes.Galar },
        { "shield", Pokedexes.Galar },

        // Hisui region
        { "legends", Pokedexes.Hisui },
        { "legends: arceus", Pokedexes.Hisui },
        { "legends arceus", Pokedexes.Hisui },

        // Paldea region
        { "scarlet", Pokedexes.Paldea },
        { "violet", Pokedexes.Paldea }
    };

    /// <summary>
    /// Get the Pokédex key for a given game name (case-insensitive, trimmed)
    /// </summary>
    /// <param name="gameName">The game name to look up</param>
    /// <returns>The Pokédex key if found, null otherwise</returns>
    public static string? GetPokedexByGame(string? gameName)
    {
        if (string.IsNullOrWhiteSpace(gameName))
            return null;

        var trimmedGame = gameName.Trim();
        return GameToPokedexMap.TryGetValue(trimmedGame, out var pokedex) ? pokedex : null;
    }

    /// <summary>
    /// Get all Pokédex region keys in order
    /// </summary>
    public static IEnumerable<string> GetAllPokedexKeys() => Regions.Keys;

    /// <summary>
    /// Get Pokédex region information by key
    /// </summary>
    public static PokedexRegion? GetRegion(string key) => Regions.TryGetValue(key, out var region) ? region : null;
}

/// <summary>
/// Represents information about a Pokédex region
/// </summary>
public class PokedexRegion
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int TotalPokemon { get; set; }
}
