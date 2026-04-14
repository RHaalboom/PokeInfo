using PokeInfo.Models;

namespace PokeInfo.Services;

public interface IPokemonService
{
    Task<List<PokemonListItemDto>> GetOverviewAsync();
    Task<PokemonDetailDto?> GetPokemonByNameAsync(string name);
}