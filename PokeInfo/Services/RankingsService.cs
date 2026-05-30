using Microsoft.EntityFrameworkCore;
using PokeInfo.Data;
using PokeInfo.Models.Rankings;

namespace PokeInfo.Services;

/// <summary>
/// Service for calculating and retrieving Pokédex rankings
/// Implements business logic for ranking calculation and sorting
/// </summary>
public class RankingsService
{
    private readonly IPokeInfoDbContext _context;

    public RankingsService(IPokeInfoDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get the ranking for a specific Pokédex region
    /// Only includes users with RankedUser or Moderator role
    /// </summary>
    /// <param name="pokedexKey">The Pokédex region key (e.g., "KANTO")</param>
    /// <returns>The ranking DTO for the specified Pokédex, or null if invalid key</returns>
    public async Task<PokedexRankingDto?> GetPokedexRanking(string pokedexKey)
    {
        // Validate the Pokédex key
        var pokedexRegion = PokedexService.GetRegion(pokedexKey);
        if (pokedexRegion == null)
            return null;

        // Get all RankedUser and Moderator role IDs
        int rankedUserRoleId = PokeInfo.Services.RoleService.RankedUserRoleId;
        int moderatorRoleId = PokeInfo.Services.RoleService.ModeratorRoleId;

        // Fetch all ranked users with their collections and Pokémon
        // Split into multiple queries to avoid EF Core expression tree issues
        var rankedUsers = await _context.Users
            .Where(u => u.RoleId == rankedUserRoleId || u.RoleId == moderatorRoleId)
            .Include(u => u.Collections)
            .ThenInclude(c => c.CollectionPokemons)
            .AsNoTracking()
            .ToListAsync();

        // Calculate rankings for this Pokédex
        var rankings = new List<RankingEntryDto>();
        var userRankings = new List<(int userId, string displayName, int collected, int percentage, bool isCompleted, DateTime? completionDate)>();

        foreach (var user in rankedUsers)
        {
            // Get all Pokémon caught in this Pokédex by this user
            // All operations are in memory after ToListAsync(), so we can use any LINQ operations
            var caughtInPokedex = user.Collections
                .SelectMany(c => c.CollectionPokemons)
                .Where(cp => !string.IsNullOrWhiteSpace(cp.CaughtInGame))
                .Where(cp => PokedexService.GetPokedexByGame(cp.CaughtInGame) == pokedexKey)
                .DistinctBy(p => p.PokemonId)
                .Select(cp => new { cp.PokemonId, cp.AddedAt })
                .ToList();

            int collected = caughtInPokedex.Count;
            int percentage = pokedexRegion.TotalPokemon > 0 
                ? (int)Math.Round((collected / (double)pokedexRegion.TotalPokemon) * 100) 
                : 0;

            bool isCompleted = collected >= pokedexRegion.TotalPokemon;
            DateTime? completionDate = isCompleted && caughtInPokedex.Any()
                ? caughtInPokedex.Max(p => p.AddedAt)
                : null;

            userRankings.Add((
                userId: user.Id,
                displayName: user.DisplayName ?? user.Username,
                collected: collected,
                percentage: percentage,
                isCompleted: isCompleted,
                completionDate: completionDate
            ));
        }

        // Sort according to business rules:
        // 1. Completed users first, sorted by completion date ascending (earliest first)
        // 2. Incomplete users sorted by highest percentage/collected count descending
        var sortedRankings = userRankings
            .OrderByDescending(r => r.isCompleted)
            .ThenBy(r => r.isCompleted ? r.completionDate : DateTime.MaxValue)
            .ThenByDescending(r => r.percentage)
            .ThenByDescending(r => r.collected)
            .ToList();

        // Create RankingEntryDto objects with positions
        for (int i = 0; i < sortedRankings.Count; i++)
        {
            var ranking = sortedRankings[i];
            rankings.Add(new RankingEntryDto
            {
                Position = i + 1,
                DisplayName = ranking.displayName,
                Collected = ranking.collected,
                Total = pokedexRegion.TotalPokemon,
                Percentage = ranking.percentage,
                IsCompleted = ranking.isCompleted,
                CompletionDate = ranking.completionDate
            });
        }

        return new PokedexRankingDto
        {
            PokedexKey = pokedexKey,
            PokedexName = pokedexRegion.Name,
            TotalPokemon = pokedexRegion.TotalPokemon,
            Rankings = rankings
        };
    }

    /// <summary>
    /// Get rankings overview for all Pokédex regions
    /// Returns a list of PokedexRankingDto, one for each region
    /// </summary>
    /// <returns>List of rankings for all Pokédex regions</returns>
    public async Task<List<PokedexRankingDto>> GetAllRankings()
    {
        var allRankings = new List<PokedexRankingDto>();

        foreach (var pokedexKey in PokedexService.GetAllPokedexKeys())
        {
            var ranking = await GetPokedexRanking(pokedexKey);
            if (ranking != null)
            {
                allRankings.Add(ranking);
            }
        }

        return allRankings;
    }
}
