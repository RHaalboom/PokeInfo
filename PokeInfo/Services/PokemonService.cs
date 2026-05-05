using Microsoft.Extensions.Caching.Memory;
using PokeInfo.Models;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace PokeInfo.Services;

public class PokemonService : IPokemonService
{
    private readonly HttpClient _httpClient;
    private readonly IMemoryCache _cache;
    private const string EnglishLanguage = "en";

    public PokemonService(HttpClient httpClient, IMemoryCache cache)
    {
        _httpClient = httpClient;
        _cache = cache;
    }

    public async Task<List<PokemonListItemDto>> GetOverviewAsync()
    {
        return await GetOrCreateCachedAsync("pokemon:overview", "pokemon?limit=1025", doc =>
        {
            var root = JsonNode.Parse(doc.RootElement.GetRawText());
            var result = new List<PokemonListItemDto>();
            int index = 0;

            foreach (var item in root!["results"]!.AsArray())
            {
                index++;
                var name = item!["name"]!.GetValue<string>();
                result.Add(new PokemonListItemDto
                {
                    Id = index,
                    Name = name,
                    ImageUrl = $"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{index}.png"
                });
            }

            return result;
        }) ?? new List<PokemonListItemDto>();
    }

    public async Task<PokemonDetailDto?> GetPokemonByNameAsync(string name)
    {
        var normalizedName = name.ToLowerInvariant();
        return await GetOrCreateCachedAsync($"pokemon:detail:{normalizedName}", $"pokemon/{normalizedName}", async doc =>
        {
            var root = doc.RootElement;
            var types = GetArrayPropertyValues(root, "types", "type", "name");
            var games = GetArrayPropertyValues(root, "game_indices", "version", "name");
            var abilityNames = GetArrayPropertyValues(root, "abilities", "ability", "name");

            var speciesUrl = root.GetProperty("species").GetProperty("url").GetString();
            var species = await GetSpeciesByUrlAsync(speciesUrl);

            EvolutionChainDto? evolutionChain = null;
            if (!string.IsNullOrWhiteSpace(species?.EvolutionChainUrl))
                evolutionChain = await GetEvolutionChainByUrlAsync(species.EvolutionChainUrl);

            var abilities = await Task.WhenAll(
                abilityNames.Select(name => GetOrCreateCachedAsync($"pokemon:ability:{name.ToLowerInvariant()}", 
                    $"ability/{name.ToLowerInvariant()}", ParseAbility))
            );

            return new PokemonDetailDto
            {
                Id = root.GetProperty("id").GetInt32(),
                Name = root.GetProperty("name").GetString() ?? string.Empty,
                ImageUrl = root.GetProperty("sprites").GetProperty("front_default").GetString() ?? string.Empty,
                Types = types,
                Abilities = abilities.Where(a => a != null).OfType<AbilityDto>().ToList(),
                Games = games,
                EvolutionChain = evolutionChain
            };
        });
    }

    private static AbilityDto? ParseAbility(JsonDocument doc)
    {
        var root = doc.RootElement;
        var englishEntry = root.GetProperty("effect_entries").EnumerateArray()
            .FirstOrDefault(e => e.GetProperty("language").GetProperty("name").GetString() == "en");

        return new AbilityDto
        {
            Id = root.GetProperty("id").GetInt32(),
            Name = root.GetProperty("name").GetString() ?? string.Empty,
            ShortEffect = englishEntry.ValueKind == JsonValueKind.Undefined ? string.Empty 
                : englishEntry.GetProperty("short_effect").GetString() ?? string.Empty,
            Effect = englishEntry.ValueKind == JsonValueKind.Undefined ? string.Empty 
                : englishEntry.GetProperty("effect").GetString() ?? string.Empty
        };
    }

    private async Task<PokemonSpeciesDto?> GetSpeciesByUrlAsync(string? speciesUrl)
    {
        if (string.IsNullOrWhiteSpace(speciesUrl))
            return null;

        return await GetOrCreateCachedAsync($"pokemon:species:{speciesUrl}", speciesUrl, doc =>
        {
            var root = doc.RootElement;
            return new PokemonSpeciesDto
            {
                Id = root.GetProperty("id").GetInt32(),
                Name = root.GetProperty("name").GetString() ?? string.Empty,
                EvolutionChainUrl = root.GetProperty("evolution_chain").GetProperty("url").GetString() ?? string.Empty
            };
        });
    }

    private async Task<EvolutionChainDto?> GetEvolutionChainByUrlAsync(string evolutionChainUrl)
    {
        return await GetOrCreateCachedAsync($"pokemon:evolution-chain:{evolutionChainUrl}", evolutionChainUrl, async doc =>
        {
            var root = doc.RootElement;
            var stages = new List<EvolutionStageDto>();
            await AddEvolutionStagesAsync(root.GetProperty("chain"), stages);

            return new EvolutionChainDto
            {
                Id = root.GetProperty("id").GetInt32(),
                Stages = stages
            };
        });
    }

    private async Task AddEvolutionStagesAsync(JsonElement chainElement, List<EvolutionStageDto> stages)
    {
        var pokemonName = chainElement.GetProperty("species").GetProperty("name").GetString() ?? string.Empty;
        var evolutionDetails = chainElement.GetProperty("evolution_details");

        int? minLevel = null;
        string? triggerName = null;
        string? itemName = null;

        if (evolutionDetails.GetArrayLength() > 0)
        {
            var detail = evolutionDetails[0];
            if (detail.TryGetProperty("min_level", out var lvl) && lvl.ValueKind != JsonValueKind.Null)
                minLevel = lvl.GetInt32();
            if (detail.TryGetProperty("trigger", out var trig) && trig.ValueKind != JsonValueKind.Null)
                triggerName = trig.GetProperty("name").GetString();
            if (detail.TryGetProperty("item", out var item) && item.ValueKind != JsonValueKind.Null)
                itemName = item.GetProperty("name").GetString();
        }

        var imageUrl = await GetOrCreateCachedAsync($"pokemon:image:{pokemonName}", $"pokemon/{pokemonName}", doc =>
        {
            return doc.RootElement.GetProperty("sprites").GetProperty("front_default").GetString() ?? string.Empty;
        }) ?? string.Empty;

        stages.Add(new EvolutionStageDto
        {
            PokemonName = pokemonName,
            ImageUrl = imageUrl,
            MinLevel = minLevel,
            TriggerName = triggerName,
            ItemName = itemName
        });

        foreach (var nextEvolution in chainElement.GetProperty("evolves_to").EnumerateArray())
            await AddEvolutionStagesAsync(nextEvolution, stages);
    }

    private static List<string> GetArrayPropertyValues(JsonElement root, string propertyName, params string[] childPath)
    {
        var values = new List<string>();
        foreach (var entry in root.GetProperty(propertyName).EnumerateArray())
        {
            JsonElement current = entry;
            foreach (var path in childPath)
                current = current.GetProperty(path);

            var value = current.GetString();
            if (!string.IsNullOrWhiteSpace(value))
                values.Add(value);
        }
        return values;
    }

    private async Task<T?> GetOrCreateCachedAsync<T>(string cacheKey, string endpoint, Func<JsonDocument, T> parser) where T : class
    {
        return await _cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            var response = await _httpClient.GetAsync(endpoint);
            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return parser(doc);
        });
    }

    private async Task<T?> GetOrCreateCachedAsync<T>(string cacheKey, string endpoint, Func<JsonDocument, Task<T>> asyncParser) where T : class
    {
        return await _cache.GetOrCreateAsync(cacheKey, async entry =>
        {
            var response = await _httpClient.GetAsync(endpoint);
            if (!response.IsSuccessStatusCode)
                return null;

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);
            return await asyncParser(doc);
        });
    }
}