using Microsoft.AspNetCore.Mvc;
using PokeInfo.Services;

namespace PokeInfo.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PokemonController : ControllerBase
{
    private readonly IPokemonService _pokemonService;

    public PokemonController(IPokemonService pokemonService)
    {
        _pokemonService = pokemonService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var pokemon = await _pokemonService.GetOverviewAsync();
        return Ok(pokemon);
    }

    [HttpGet("{name}")]
    public async Task<IActionResult> GetByName(string name)
    {
        var pokemon = await _pokemonService.GetPokemonByNameAsync(name);

        if (pokemon == null)
        {
            return NotFound($"Pokémon '{name}' niet gevonden.");
        }

        return Ok(pokemon);
    }
}