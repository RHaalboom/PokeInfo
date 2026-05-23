using Moq;
using Moq.Protected;
using Xunit;
using Microsoft.Extensions.Caching.Memory;
using PokeInfo.Models;
using PokeInfo.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PokeInfo.Tests;

/// <summary>
/// Unit tests for the PokemonService covering data retrieval and caching logic.
/// These tests validate Pokémon API calls, data parsing, and cache behavior.
/// </summary>
public class PokemonServiceTests
{
    private readonly IMemoryCache _memoryCache;

    public PokemonServiceTests()
    {
        _memoryCache = new MemoryCache(new MemoryCacheOptions());
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
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
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
        Assert.Equal("pokemon1", result[0].Name);
    }

    /// <summary>
    /// Happy path: GetOverviewAsync should cache results after first call.
    /// Validates: Second call uses cached data, reducing API calls.
    /// </summary>
    [Fact]
    public async Task GetOverviewAsync_ShouldUseCachedData_OnSecondCall()
    {
        // Arrange
        var mockResponse = CreateMockOverviewResponse(2);
        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
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
            ItExpr.IsAny<HttpRequestMessage>(),
            ItExpr.IsAny<CancellationToken>());
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
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
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
        Assert.Equal(1, firstPokemon.Generation); // First Pokémon should be Gen 1
    }

    /// <summary>
    /// Happy path: Pokémon list items should have image URLs.
    /// Validates: Image URL is properly constructed from Pokémon ID.
    /// </summary>
    [Fact]
    public async Task GetOverviewAsync_ShouldHaveImageUrls_ForEachPokemon()
    {
        // Arrange
        var mockResponse = CreateMockOverviewResponse(2);
        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(mockResponse);

        var httpClient = new HttpClient(handlerMock.Object)
        {
            BaseAddress = new Uri("https://pokeapi.co/api/v2/")
        };
        var service = new PokemonService(httpClient, _memoryCache);

        // Act
        var result = await service.GetOverviewAsync();

        // Assert
        foreach (var pokemon in result)
        {
            Assert.False(string.IsNullOrEmpty(pokemon.ImageUrl));
            Assert.Contains("githubusercontent.com", pokemon.ImageUrl);
        }
    }

    /// <summary>
    /// Unhappy path: GetOverviewAsync should handle network errors gracefully.
    /// Validates: Exception during API call returns empty list.
    /// </summary>
    [Fact]
    public async Task GetOverviewAsync_ShouldReturnEmptyList_WhenNetworkFails()
    {
        // Arrange
        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
            .ReturnsAsync(new HttpResponseMessage(System.Net.HttpStatusCode.InternalServerError));

        var httpClient = new HttpClient(handlerMock.Object)
        {
            BaseAddress = new Uri("https://pokeapi.co/api/v2/")
        };
        var service = new PokemonService(httpClient, _memoryCache);

        // Act
        var result = await service.GetOverviewAsync();

        // Assert
        Assert.NotNull(result);
        Assert.Empty(result);
    }

    /// <summary>
    /// Happy path: Pokémon list should not be empty when API returns valid data.
    /// Validates: Successful API response is properly parsed.
    /// </summary>
    [Fact]
    public async Task GetOverviewAsync_ShouldPopulateList_WithValidResponse()
    {
        // Arrange
        var mockResponse = CreateMockOverviewResponse(5);
        var handlerMock = new Mock<HttpMessageHandler>();
        handlerMock
            .Protected()
            .Setup<Task<HttpResponseMessage>>(
                "SendAsync",
                ItExpr.IsAny<HttpRequestMessage>(),
                ItExpr.IsAny<CancellationToken>())
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
        Assert.Equal(5, result.Count);
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

        return new HttpResponseMessage(System.Net.HttpStatusCode.OK)
        {
            Content = content
        };
    }

    #endregion
}
