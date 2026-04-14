using System.Text.Json;
using PokeInfo.Models;

namespace PokeInfo.Services;

public class PokemonService : IPokemonService
{
    private readonly HttpClient _httpClient;

    public PokemonService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<List<PokemonListItemDto>> GetOverviewAsync()
    {
        var results = new List<PokemonListItemDto>();

        for (int i = 1; i <= 151; i++)
        {
            var response = await _httpClient.GetAsync($"pokemon/{i}");
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(json);

            var root = document.RootElement;

            results.Add(new PokemonListItemDto
            {
                Id = root.GetProperty("id").GetInt32(),
                Name = root.GetProperty("name").GetString() ?? string.Empty,
                ImageUrl = root
                    .GetProperty("sprites")
                    .GetProperty("front_default")
                    .GetString() ?? string.Empty
            });
        }

        return results;
    }

    public async Task<PokemonDetailDto?> GetPokemonByNameAsync(string name)
    {
        var response = await _httpClient.GetAsync($"pokemon/{name.ToLower()}");

        if (!response.IsSuccessStatusCode)
        {
            return null;
        }

        var json = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(json);

        var root = document.RootElement;

        var types = new List<string>();
        foreach (var typeEntry in root.GetProperty("types").EnumerateArray())
        {
            var typeName = typeEntry
                .GetProperty("type")
                .GetProperty("name")
                .GetString();

            if (!string.IsNullOrWhiteSpace(typeName))
            {
                types.Add(typeName);
            }
        }

        var abilities = new List<string>();
        foreach (var abilityEntry in root.GetProperty("abilities").EnumerateArray())
        {
            var abilityName = abilityEntry
                .GetProperty("ability")
                .GetProperty("name")
                .GetString();

            if (!string.IsNullOrWhiteSpace(abilityName))
            {
                abilities.Add(abilityName);
            }
        }

        var games = new List<string>();
        foreach (var gameEntry in root.GetProperty("game_indices").EnumerateArray())
        {
            var gameName = gameEntry
                .GetProperty("version")
                .GetProperty("name")
                .GetString();

            if (!string.IsNullOrWhiteSpace(gameName))
            {
                games.Add(gameName);
            }
        }

        return new PokemonDetailDto
        {
            Id = root.GetProperty("id").GetInt32(),
            Name = root.GetProperty("name").GetString() ?? string.Empty,
            ImageUrl = root
                .GetProperty("sprites")
                .GetProperty("front_default")
                .GetString() ?? string.Empty,
            Types = types,
            Abilities = abilities,
            Games = games
        };
    }
}