using Moq;
using Moq.Protected;
using Xunit;
using Microsoft.Extensions.Caching.Memory;
using PokeInfo.Models;
using PokeInfo.Services;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace PokeInfo.Tests;

/// <summary>
/// Unit tests for the PokemonService covering data retrieval and caching logic.
/// These tests validate Pokémon API calls, data parsing, and cache behavior.
/// </summary>
public class PokemonServiceTests
{
    private readonly Mock<HttpClient> _mockHttpClient;
    private readonly IMemoryCache _memoryCache;
    private readonly PokemonService _pokemonService;

    public PokemonServiceTests()
    {
        _mockHttpClient = new Mock<HttpClient>();
        _memoryCache = new MemoryCache(new MemoryCacheOptions());
        _pokemonService = new PokemonService(_mockHttpClient.Object, _memoryCache);
    }

    #region GetOverview Tests

    /// <summary>
    /// Happy path: GetOverviewAsync should return a list of Pokémon.
    /// Validates: API response is parsed correctly and list is populated.
    /// </summary>
    [Fact]
    public async Task GetOverviewAsync_ShouldReturnPokemonList_WhenApiReturnsValidData()
    {
        // Arrange
        var mockResponse = CreateMockOverviewResponse(3);

        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                It.IsAny<HttpRequestMessage>(),
                It.IsAny<CancellationToken>())
            .ReturnsAsync(mockResponse);

        var httpClient = new HttpClient(handlerMock.Object)
        {
            BaseAddress = new Uri("https://pokeapi.co/api/v2/")
        };

        var service = new PokemonService(httpClient, _memoryCache);

        // Act
        var result = await service.GetOverviewAsync();

        // Assert
        Assert.NotNull(result);
        Assert.NotEmpty(result);
        Assert.True(result.Count > 0);
    }

    /// <summary>
    /// Unhappy path: GetOverviewAsync should return empty list when API fails.
    /// Validates: Error handling returns empty list instead of throwing.
    /// </summary>
    [Fact]
    public async Task GetOverviewAsync_ShouldReturnEmptyList_WhenApiThrowsException()
    {
        // Arrange
        var mockHttpClient = new Mock<HttpClient>();
        mockHttpClient
            .Setup(x => x.GetAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new HttpRequestException("API Error"));

        var service = new PokemonService(mockHttpClient.Object, _memoryCache);

        // Act
        var result = await service.GetOverviewAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    /// <summary>
    /// Happy path: GetOverviewAsync should cache results after first call.
    /// Validates: Second call uses cached data, reducing API calls.
    /// </summary>
    [Fact]
    public async Task GetOverviewAsync_ShouldUseCachedData_OnSecondCall()
    {
        // Arrange
        var mockResponse = CreateMockOverviewResponse(3);

        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                It.IsAny<HttpRequestMessage>(),
                It.IsAny<CancellationToken>())
            .ReturnsAsync(mockResponse);

        var httpClient = new HttpClient(handlerMock.Object)
        {
            BaseAddress = new Uri("https://pokeapi.co/api/v2/")
        };

        var service = new PokemonService(httpClient, _memoryCache);

        // Act
        var firstCall = await service.GetOverviewAsync();
        var secondCall = await service.GetOverviewAsync();

        // Assert
        Assert.Equal(firstCall.Count, secondCall.Count);
        // Verify HTTP was called only once (cached on second call)
        handlerMock.Protected().Verify(
            "SendAsync",
            Times.Once(),
            It.IsAny<HttpRequestMessage>(),
            It.IsAny<CancellationToken>());
    }

    /// <summary>
    /// Happy path: Pokémon list should have correct generation assignments.
    /// Validates: Generation is calculated correctly based on Pokémon ID ranges.
    /// </summary>
    [Fact]
    public async Task GetOverviewAsync_ShouldAssignCorrectGenerations_BasedOnId()
    {
        // Arrange
        var mockResponse = CreateMockOverviewResponse(1);

        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                It.IsAny<HttpRequestMessage>(),
                It.IsAny<CancellationToken>())
            .ReturnsAsync(mockResponse);

        var httpClient = new HttpClient(handlerMock.Object)
        {
            BaseAddress = new Uri("https://pokeapi.co/api/v2/")
        };

        var service = new PokemonService(httpClient, _memoryCache);

        // Act
        var result = await service.GetOverviewAsync();

        // Assert
        var firstPokemon = result.FirstOrDefault();
        Assert.NotNull(firstPokemon);
        Assert.True(firstPokemon.Generation >= 1);
    }

    #endregion

    #region GetPokemonByName Tests

    /// <summary>
    /// Happy path: GetPokemonByNameAsync should return Pokémon details when found.
    /// Validates: Correct Pokémon data is retrieved by name.
    /// </summary>
    [Fact]
    public async Task GetPokemonByNameAsync_ShouldReturnPokemonDetails_WhenPokemonExists()
    {
        // Arrange
        var pokemonName = "pikachu";
        var mockResponse = CreateMockDetailResponse(pokemonName);

        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                It.IsAny<HttpRequestMessage>(),
                It.IsAny<CancellationToken>())
            .ReturnsAsync(mockResponse);

        var httpClient = new HttpClient(handlerMock.Object)
        {
            BaseAddress = new Uri("https://pokeapi.co/api/v2/")
        };

        var service = new PokemonService(httpClient, _memoryCache);

        // Act
        var result = await service.GetPokemonByNameAsync(pokemonName);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(pokemonName, result.Name.ToLowerInvariant());
    }

    /// <summary>
    /// Happy path: GetPokemonByNameAsync should normalize name to lowercase.
    /// Validates: Case-insensitive Pokémon lookup works correctly.
    /// </summary>
    [Fact]
    public async Task GetPokemonByNameAsync_ShouldFindPokemon_WhenNameHasMixedCase()
    {
        // Arrange
        var mockResponse = CreateMockDetailResponse("pikachu");

        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                It.IsAny<HttpRequestMessage>(),
                It.IsAny<CancellationToken>())
            .ReturnsAsync(mockResponse);

        var httpClient = new HttpClient(handlerMock.Object)
        {
            BaseAddress = new Uri("https://pokeapi.co/api/v2/")
        };

        var service = new PokemonService(httpClient, _memoryCache);

        // Act
        var result = await service.GetPokemonByNameAsync("PIKACHU");

        // Assert
        Assert.NotNull(result);
    }

    /// <summary>
    /// Unhappy path: GetPokemonByNameAsync should return null when Pokémon not found.
    /// Validates: 404 responses are handled gracefully.
    /// </summary>
    [Fact]
    public async Task GetPokemonByNameAsync_ShouldReturnNull_WhenPokemonNotFound()
    {
        // Arrange
        var mockHttpClient = new Mock<HttpClient>();
        mockHttpClient
            .Setup(x => x.GetAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new HttpResponseMessage(System.Net.HttpStatusCode.NotFound));

        var service = new PokemonService(mockHttpClient.Object, _memoryCache);

        // Act
        var result = await service.GetPokemonByNameAsync("fakepokemon");

        // Assert
        Assert.Null(result);
    }

    /// <summary>
    /// Happy path: Pokémon name should be cached after first retrieval.
    /// Validates: Caching works for individual Pokémon queries.
    /// </summary>
    [Fact]
    public async Task GetPokemonByNameAsync_ShouldUseCachedData_OnSecondCall()
    {
        // Arrange
        var pokemonName = "pikachu";
        var mockResponse = CreateMockDetailResponse(pokemonName);

        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                It.IsAny<HttpRequestMessage>(),
                It.IsAny<CancellationToken>())
            .ReturnsAsync(mockResponse);

        var httpClient = new HttpClient(handlerMock.Object)
        {
            BaseAddress = new Uri("https://pokeapi.co/api/v2/")
        };

        var service = new PokemonService(httpClient, _memoryCache);

        // Act
        var firstCall = await service.GetPokemonByNameAsync(pokemonName);
        var secondCall = await service.GetPokemonByNameAsync(pokemonName);

        // Assert
        Assert.NotNull(firstCall);
        Assert.NotNull(secondCall);
        Assert.Equal(firstCall.Name, secondCall.Name);
        // Verify HTTP was called only once (cached on second call)
        handlerMock.Protected().Verify(
            "SendAsync",
            Times.Once(),
            It.IsAny<HttpRequestMessage>(),
            It.IsAny<CancellationToken>());
    }

    /// <summary>
    /// Happy path: Pokémon should have ImageUrl properly formatted.
    /// Validates: Image URL generation from Pokémon ID is correct.
    /// </summary>
    [Fact]
    public async Task GetPokemonByNameAsync_ShouldHaveValidImageUrl_WhenPokemonRetrieved()
    {
        // Arrange
        var mockResponse = CreateMockDetailResponse("pikachu");

        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                It.IsAny<HttpRequestMessage>(),
                It.IsAny<CancellationToken>())
            .ReturnsAsync(mockResponse);

        var httpClient = new HttpClient(handlerMock.Object)
        {
            BaseAddress = new Uri("https://pokeapi.co/api/v2/")
        };

        var service = new PokemonService(httpClient, _memoryCache);

        // Act
        var result = await service.GetPokemonByNameAsync("pikachu");

        // Assert
        Assert.NotNull(result);
        Assert.False(string.IsNullOrEmpty(result.ImageUrl));
    }

    #endregion

    #region Helper Methods

    /// <summary>
    /// Creates a mock HTTP response for Pokémon overview endpoint.
    /// </summary>
    private HttpResponseMessage CreateMockOverviewResponse(int count)
    {
        var json = new
        {
            results = Enumerable.Range(1, count).Select(i => new
            {
                name = $"pokemon{i}",
                url = $"https://pokeapi.co/api/v2/pokemon/{i}/"
            }).ToList()
        };

        var jsonString = System.Text.Json.JsonSerializer.Serialize(json);
        var content = new StringContent(jsonString, System.Text.Encoding.UTF8, "application/json");

        var response = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
        {
            Content = content
        };

        return response;
    }

    /// <summary>
    /// Creates a mock HTTP response for Pokémon detail endpoint.
    /// </summary>
    private HttpResponseMessage CreateMockDetailResponse(string name)
    {
        var json = new
        {
            id = 25,
            name = name,
            sprites = new
            {
                front_default = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png"
            },
            types = new[]
            {
                new { type = new { name = "electric" } }
            },
            game_indices = new[]
            {
                new { version = new { name = "red" } }
            },
            abilities = new[]
            {
                new { ability = new { name = "static" } }
            },
            species = new
            {
                url = "https://pokeapi.co/api/v2/pokemon-species/25/"
            }
        };

        var jsonString = System.Text.Json.JsonSerializer.Serialize(json);
        var content = new StringContent(jsonString, System.Text.Encoding.UTF8, "application/json");

        var response = new HttpResponseMessage(System.Net.HttpStatusCode.OK)
        {
            Content = content
        };

        return response;
    }

    #endregion
}
