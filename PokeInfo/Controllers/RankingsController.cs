using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PokeInfo.Models.Rankings;
using PokeInfo.Services;
using System.Security.Claims;

namespace PokeInfo.Controllers;

/// <summary>
/// Controller for retrieving Pokédex rankings
/// Only accessible to RankedUser and Moderator roles
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RankingsController : ControllerBase
{
    private readonly RankingsService _rankingsService;
    private readonly ILogger<RankingsController> _logger;

    public RankingsController(RankingsService rankingsService, ILogger<RankingsController> logger)
    {
        _rankingsService = rankingsService;
        _logger = logger;
    }

    /// <summary>
    /// Get the ranking for a specific Pokédex region
    /// </summary>
    /// <param name="pokedexKey">The Pokédex region key (e.g., KANTO, JOHTO)</param>
    /// <returns>The ranking DTO for the specified Pokédex</returns>
    [HttpGet("pokedex/{pokedexKey}")]
    public async Task<IActionResult> GetPokedexRanking(string pokedexKey)
    {
        try
        {
            // Log all claims for debugging
            var allClaims = User.Claims.ToList();
            _logger.LogInformation("All claims for user: {claims}", string.Join(", ", allClaims.Select(c => $"{c.Type}={c.Value}")));

            // Check authorization - only RankedUser and Moderator can view rankings
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var roleId = GetRoleId(userRole);

            _logger.LogInformation("User role claim: {role}, converted to roleId: {roleId}, CanSeeRankings: {canSee}", userRole ?? "null", roleId, RoleService.CanSeeRankings(roleId));

            if (!RoleService.CanSeeRankings(roleId))
            {
                _logger.LogWarning("Unauthorized ranking access attempt by user with role: {role} (roleId: {roleId})", userRole ?? "null", roleId);
                return Forbid();
            }

            _logger.LogInformation("Fetching rankings for Pokédex: {pokedexKey}", pokedexKey);
            var ranking = await _rankingsService.GetPokedexRanking(pokedexKey.ToUpper());

            if (ranking == null)
            {
                _logger.LogWarning("Pokédex not found: {pokedexKey}", pokedexKey);
                return NotFound(new { message = "Pokédex not found" });
            }

            return Ok(ranking);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching rankings for Pokédex: {pokedexKey}", pokedexKey);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while fetching rankings" });
        }
    }

    /// <summary>
    /// Get rankings overview for all Pokédex regions
    /// </summary>
    /// <returns>List of rankings for all Pokédex regions</returns>
    [HttpGet("overview")]
    public async Task<IActionResult> GetAllRankings()
    {
        try
        {
            // Log all claims for debugging
            var allClaims = User.Claims.ToList();
            _logger.LogInformation("All claims for user: {claims}", string.Join(", ", allClaims.Select(c => $"{c.Type}={c.Value}")));

            // Check authorization - only RankedUser and Moderator can view rankings
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            var roleId = GetRoleId(userRole);

            _logger.LogInformation("User role claim: {role}, converted to roleId: {roleId}, CanSeeRankings: {canSee}", userRole ?? "null", roleId, RoleService.CanSeeRankings(roleId));

            if (!RoleService.CanSeeRankings(roleId))
            {
                _logger.LogWarning("Unauthorized ranking access attempt by user with role: {role} (roleId: {roleId})", userRole ?? "null", roleId);
                return Forbid();
            }

            _logger.LogInformation("Fetching all rankings overview");
            var rankings = await _rankingsService.GetAllRankings();
            return Ok(rankings);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching rankings overview");
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "An error occurred while fetching rankings" });
        }
    }

    /// <summary>
    /// Helper method to convert role name string to role ID
    /// </summary>
    private static int GetRoleId(string? roleName) => roleName?.ToLower() switch
    {
        "user" => RoleService.UserRoleId,
        "rankeduser" => RoleService.RankedUserRoleId,
        "moderator" => RoleService.ModeratorRoleId,
        _ => RoleService.UserRoleId
    };
}
