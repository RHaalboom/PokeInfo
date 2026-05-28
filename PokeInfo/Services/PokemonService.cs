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
                    ImageUrl = $"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{index}.png",
                    Generation = GetGenerationFromId(index)
                });
            }

            return result;
        }) ?? new List<PokemonListItemDto>();
    }

    private int GetGenerationFromId(int pokemonId)
    {
        // Generation ranges based on Pokémon ID
        if (pokemonId <= 151) return 1;        // Gen 1: 1-151
        if (pokemonId <= 251) return 2;        // Gen 2: 152-251
        if (pokemonId <= 386) return 3;        // Gen 3: 252-386
        if (pokemonId <= 493) return 4;        // Gen 4: 387-493
        if (pokemonId <= 649) return 5;        // Gen 5: 494-649
        if (pokemonId <= 721) return 6;        // Gen 6: 650-721
        if (pokemonId <= 809) return 7;        // Gen 7: 722-809
        if (pokemonId <= 905) return 8;        // Gen 8: 810-905
        if (pokemonId <= 1025) return 9;       // Gen 9: 906-1025
        return 1;                               // Default to Gen 1
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

            var variants = species?.Variants ?? new List<PokemonVariantDto>();

            // Fetch type effectiveness data
            TypeEffectivenessDto? typeEffectiveness = null;
            if (types.Count > 0)
            {
                typeEffectiveness = await GetTypeEffectivenessAsync(types);
            }

            return new PokemonDetailDto
            {
                Id = root.GetProperty("id").GetInt32(),
                Name = root.GetProperty("name").GetString() ?? string.Empty,
                ImageUrl = root.GetProperty("sprites").GetProperty("front_default").GetString() ?? string.Empty,
                Types = types,
                Abilities = abilities.Where(a => a != null).OfType<AbilityDto>().ToList(),
                Games = games,
                Variants = variants,
                EvolutionChain = evolutionChain,
                TypeEffectiveness = typeEffectiveness
            };
        });
    }

    private async Task<TypeEffectivenessDto> GetTypeEffectivenessAsync(List<string> types)
    {
        var strengths = new HashSet<string>();
        var weaknesses = new HashSet<string>();
        var typeDataByType = new Dictionary<string, TypeEffectivenessDto>();

        // Fetch type effectiveness for each type
        foreach (var type in types)
        {
            var typeData = await GetOrCreateCachedAsync($"pokemon:type:{type.ToLowerInvariant()}", 
                $"type/{type.ToLowerInvariant()}", ParseTypeEffectiveness);

            if (typeData != null)
            {
                typeDataByType[type] = typeData;

                foreach (var strength in typeData.Strengths)
                    strengths.Add(strength);

                foreach (var weakness in typeData.Weaknesses)
                    weaknesses.Add(weakness);
            }
        }

        // Calculate super-weak types (4x weak) - only applies if pokemon has 2+ types
        // A type is 4x weak only if it's weak to ALL of the pokemon's types
        var superWeak = new List<string>();
        if (types.Count >= 2)
        {
            superWeak = new List<string>(weaknesses);
            foreach (var type in types)
            {
                if (typeDataByType.TryGetValue(type, out var typeData))
                {
                    // Keep only types that are in this type's weaknesses
                    superWeak = superWeak.Intersect(typeData.Weaknesses).ToList();
                }
            }
        }

        return new TypeEffectivenessDto
        {
            Strengths = strengths.ToList(),
            Weaknesses = weaknesses.ToList(),
            SuperEffective = superWeak
        };
    }

    private static TypeEffectivenessDto ParseTypeEffectiveness(JsonDocument doc)
    {
        var root = doc.RootElement;
        var damageRelations = root.GetProperty("damage_relations");

        var strengths = new List<string>();
        var weaknesses = new List<string>();

        // Parse types that deal double damage TO this type (what this type is weak to)
        if (damageRelations.TryGetProperty("double_damage_from", out var doubleDamageFrom))
        {
            foreach (var type in doubleDamageFrom.EnumerateArray())
            {
                var typeName = type.GetProperty("name").GetString();
                if (!string.IsNullOrWhiteSpace(typeName))
                    weaknesses.Add(typeName);
            }
        }

        // Parse types that take double damage FROM this type (what this type is strong against)
        if (damageRelations.TryGetProperty("double_damage_to", out var doubleDamageTo))
        {
            foreach (var type in doubleDamageTo.EnumerateArray())
            {
                var typeName = type.GetProperty("name").GetString();
                if (!string.IsNullOrWhiteSpace(typeName))
                    strengths.Add(typeName);
            }
        }

        return new TypeEffectivenessDto
        {
            Strengths = strengths,
            Weaknesses = weaknesses
        };
    }

    private static AbilityDto ParseAbility(JsonDocument doc)
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

    private static ItemDto ParseItem(JsonDocument doc)
    {
        var root = doc.RootElement;
        var sprites = root.GetProperty("sprites");

        var imageUrl = string.Empty;
        if (sprites.TryGetProperty("default", out var defaultSprite) && defaultSprite.ValueKind != JsonValueKind.Null)
        {
            imageUrl = defaultSprite.GetString() ?? string.Empty;
        }

        return new ItemDto
        {
            Id = root.GetProperty("id").GetInt32(),
            Name = root.GetProperty("name").GetString() ?? string.Empty,
            ImageUrl = imageUrl
        };
    }

    private async Task<PokemonSpeciesDto?> GetSpeciesByUrlAsync(string? speciesUrl)
    {
        if (string.IsNullOrWhiteSpace(speciesUrl))
            return null;

        return await GetOrCreateCachedAsync($"pokemon:species:{speciesUrl}", speciesUrl, doc =>
        {
            var root = doc.RootElement;
            var variants = new List<PokemonVariantDto>();

            if (root.TryGetProperty("varieties", out var varietiesElement))
            {
                foreach (var variety in varietiesElement.EnumerateArray())
                {
                    if (variety.TryGetProperty("pokemon", out var pokemonElement) &&
                        variety.TryGetProperty("is_default", out var isDefaultElement))
                    {
                        // Skip the default variant as it's shown as "Default" button
                        if (isDefaultElement.GetBoolean())
                            continue;

                        var variantName = pokemonElement.GetProperty("name").GetString() ?? string.Empty;
                        var variantUrl = pokemonElement.GetProperty("url").GetString();

                        // Extract ID from URL (format: .../pokemon/12345/)
                        if (!string.IsNullOrEmpty(variantUrl))
                        {
                            var urlParts = variantUrl.TrimEnd('/').Split('/');
                            if (urlParts.Length > 0 && int.TryParse(urlParts[urlParts.Length - 1], out var variantId))
                            {
                                var imageUrl = $"https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{variantId}.png";
                                variants.Add(new PokemonVariantDto
                                {
                                    Name = variantName,
                                    ImageUrl = imageUrl
                                });
                            }
                        }
                    }
                }
            }

            return new PokemonSpeciesDto
            {
                Id = root.GetProperty("id").GetInt32(),
                Name = root.GetProperty("name").GetString() ?? string.Empty,
                EvolutionChainUrl = root.GetProperty("evolution_chain").GetProperty("url").GetString() ?? string.Empty,
                Variants = variants
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
        ItemDto? item = null;

        if (evolutionDetails.GetArrayLength() > 0)
        {
            var detail = evolutionDetails[0];
            if (detail.TryGetProperty("min_level", out var lvl) && lvl.ValueKind != JsonValueKind.Null)
                minLevel = lvl.GetInt32();
            if (detail.TryGetProperty("trigger", out var trig) && trig.ValueKind != JsonValueKind.Null)
                triggerName = trig.GetProperty("name").GetString();
            if (detail.TryGetProperty("item", out var itemElement) && itemElement.ValueKind != JsonValueKind.Null)
            {
                var itemName = itemElement.GetProperty("name").GetString() ?? string.Empty;
                item = await GetOrCreateCachedAsync($"pokemon:item:{itemName}", $"item/{itemName}", ParseItem);
            }
        }

        var imageUrl = await GetOrCreateCachedAsync($"pokemon:image:{pokemonName}", $"pokemon/{pokemonName}", doc =>
        {
            return doc.RootElement.GetProperty("sprites").GetProperty("front_default").GetString() ?? string.Empty;
        }) ?? string.Empty;

        // Fetch types for this Pokémon
        var types = await GetOrCreateCachedAsync($"pokemon:types:{pokemonName}", $"pokemon/{pokemonName}", doc =>
        {
            return GetArrayPropertyValues(doc.RootElement, "types", "type", "name");
        }) ?? new List<string>();

        stages.Add(new EvolutionStageDto
        {
            PokemonName = pokemonName,
            ImageUrl = imageUrl,
            MinLevel = minLevel,
            TriggerName = triggerName,
            Item = item,
            Types = types
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