using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PokeInfo.Data;
using PokeInfo.Entities;
using PokeInfo.Models.Collections;
using System.Security.Claims;

namespace PokeInfo.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CollectionsController : ControllerBase
{
    private readonly PokeInfoDbContext _context;

    public CollectionsController(PokeInfoDbContext context)
    {
        _context = context;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return int.Parse(userIdClaim?.Value ?? "0");
    }

    [HttpGet]
    public async Task<ActionResult<List<CollectionDto>>> GetUserCollections()
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized();

        var collections = await _context.Collections
            .Where(c => c.UserId == userId)
            .Include(c => c.CollectionPokemons)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CollectionDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt,
                Pokemons = c.CollectionPokemons.Select(cp => new CollectionPokemonDto
                {
                    Id = cp.Id,
                    PokemonId = cp.PokemonId,
                    PokemonName = cp.PokemonName,
                    CaughtInGame = cp.CaughtInGame,
                    AddedAt = cp.AddedAt
                }).ToList()
            })
            .ToListAsync();

        return Ok(collections);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CollectionDto>> GetCollection(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized();

        var collection = await _context.Collections
            .Where(c => c.Id == id && c.UserId == userId)
            .Include(c => c.CollectionPokemons)
            .FirstOrDefaultAsync();

        if (collection == null)
            return NotFound();

        return Ok(new CollectionDto
        {
            Id = collection.Id,
            Name = collection.Name,
            Description = collection.Description,
            CreatedAt = collection.CreatedAt,
            UpdatedAt = collection.UpdatedAt,
            Pokemons = collection.CollectionPokemons.Select(cp => new CollectionPokemonDto
            {
                Id = cp.Id,
                PokemonId = cp.PokemonId,
                PokemonName = cp.PokemonName,
                CaughtInGame = cp.CaughtInGame,
                AddedAt = cp.AddedAt
            }).ToList()
        });
    }

    [HttpPost]
    public async Task<ActionResult<CollectionDto>> CreateCollection(CreateCollectionDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized();

        var userExists = await _context.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return NotFound("User not found");

        var collection = new Collection
        {
            Name = request.Name,
            Description = request.Description,
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Collections.Add(collection);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCollection), new { id = collection.Id }, new CollectionDto
        {
            Id = collection.Id,
            Name = collection.Name,
            Description = collection.Description,
            CreatedAt = collection.CreatedAt,
            UpdatedAt = collection.UpdatedAt,
            Pokemons = new()
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCollection(int id, UpdateCollectionDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized();

        var collection = await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (collection == null)
            return NotFound();

        collection.Name = request.Name;
        collection.Description = request.Description;
        collection.UpdatedAt = DateTime.UtcNow;

        _context.Collections.Update(collection);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCollection(int id)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized();

        var collection = await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (collection == null)
            return NotFound();

        _context.Collections.Remove(collection);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{collectionId}/pokemon")]
    public async Task<ActionResult<CollectionPokemonDto>> AddPokemonToCollection(int collectionId, AddPokemonToCollectionDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized();

        var collection = await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == collectionId && c.UserId == userId);

        if (collection == null)
            return NotFound("Collection not found");

        var pokemonExists = await _context.CollectionPokemons
            .AnyAsync(cp => cp.CollectionId == collectionId && cp.PokemonId == request.PokemonId);

        if (pokemonExists)
            return BadRequest("This Pokémon is already in the collection");

        var collectionPokemon = new CollectionPokemon
        {
            CollectionId = collectionId,
            PokemonId = request.PokemonId,
            PokemonName = request.PokemonName,
            CaughtInGame = request.CaughtInGame,
            AddedAt = DateTime.UtcNow
        };

        _context.CollectionPokemons.Add(collectionPokemon);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(AddPokemonToCollection), new CollectionPokemonDto
        {
            Id = collectionPokemon.Id,
            PokemonId = collectionPokemon.PokemonId,
            PokemonName = collectionPokemon.PokemonName,
            CaughtInGame = collectionPokemon.CaughtInGame,
            AddedAt = collectionPokemon.AddedAt
        });
    }

    [HttpPut("{collectionId}/pokemon/{pokemonId}/game")]
    public async Task<IActionResult> UpdatePokemonGame(int collectionId, int pokemonId, [FromBody] UpdatePokemonGameDto request)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized();

        var collection = await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == collectionId && c.UserId == userId);

        if (collection == null)
            return NotFound("Collection not found");

        var collectionPokemon = await _context.CollectionPokemons
            .FirstOrDefaultAsync(cp => cp.CollectionId == collectionId && cp.PokemonId == pokemonId);

        if (collectionPokemon == null)
            return NotFound("Pokémon not found in collection");

        collectionPokemon.CaughtInGame = request.Game;
        _context.CollectionPokemons.Update(collectionPokemon);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{collectionId}/pokemon/{pokemonId}")]
    public async Task<IActionResult> RemovePokemonFromCollection(int collectionId, int pokemonId)
    {
        var userId = GetCurrentUserId();
        if (userId == 0)
            return Unauthorized();

        var collection = await _context.Collections
            .FirstOrDefaultAsync(c => c.Id == collectionId && c.UserId == userId);

        if (collection == null)
            return NotFound("Collection not found");

        var collectionPokemon = await _context.CollectionPokemons
            .FirstOrDefaultAsync(cp => cp.CollectionId == collectionId && cp.PokemonId == pokemonId);

        if (collectionPokemon == null)
            return NotFound("Pokémon not found in collection");

        _context.CollectionPokemons.Remove(collectionPokemon);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
