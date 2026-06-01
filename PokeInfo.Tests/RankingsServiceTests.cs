using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using PokeInfo.Entities;
using PokeInfo.Services;
using PokeInfo.Data;
using System.Linq.Expressions;
using PokeInfo.Models.Rankings;

namespace PokeInfo.Tests;

public class RankingsServiceTests
{
    [Fact]
    public async Task GetPokedexRanking_ShouldOnlyIncludeRankedUserAndModeratorRoles()
    {
        // Arrange - Use in-memory database context for proper Include/ThenInclude support
        var options = new DbContextOptionsBuilder<PokeInfoDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new PokeInfoDbContext(options);

        // Create roles
        var userRole = new Role { Id = RoleService.UserRoleId, Name = "User" };
        var moderatorRole = new Role { Id = RoleService.ModeratorRoleId, Name = "Moderator" };

        context.Roles.Add(userRole);
        context.Roles.Add(moderatorRole);

        // Create test users
        var rankedUser = new User
        {
            Id = 1,
            Username = "ranked_user",
            Email = "ranked@test.com",
            PasswordHash = "hash123",
            RoleId = RoleService.UserRoleId,
            Role = userRole,
            Ranked = 1,
            Collections = new List<Collection>()
        };

        var regularUser = new User
        {
            Id = 2,
            Username = "regular_user",
            Email = "regular@test.com",
            PasswordHash = "hash123",
            RoleId = RoleService.UserRoleId,
            Role = userRole,
            Ranked = null,
            Collections = new List<Collection>()
        };

        var moderatorUser = new User
        {
            Id = 3,
            Username = "moderator",
            Email = "moderator@test.com",
            PasswordHash = "hash123",
            RoleId = RoleService.ModeratorRoleId,
            Role = moderatorRole,
            Ranked = null,
            Collections = new List<Collection>()
        };

        context.Users.Add(rankedUser);
        context.Users.Add(regularUser);
        context.Users.Add(moderatorUser);
        context.SaveChanges();

        var service = new RankingsService(context);

        // Act
        var result = await service.GetPokedexRanking("KANTO");

        // Assert
        Assert.NotNull(result);
        // Only users with Ranked=1 or role ID 2 (Moderator) should be included
        // That's: ranked_user (Ranked=1) and moderator (RoleId=2)
        // regular_user should NOT be included since Ranked is null and they're a regular user
        Assert.Equal(2, result.Rankings.Count);
        Assert.Single(result.Rankings.Where(r => r.DisplayName == "ranked_user"));
        Assert.Single(result.Rankings.Where(r => r.DisplayName == "moderator"));
    }

    [Fact]
    public async Task GetPokedexRanking_ShouldReturnNullForInvalidPokedexKey()
    {
        // Arrange
        var mockContext = new Mock<IPokeInfoDbContext>();
        var usersDbSet = new Mock<DbSet<User>>();
        var users = new List<User>().AsQueryable();

        usersDbSet.As<IQueryable<User>>().Setup(m => m.Provider).Returns(users.Provider);
        usersDbSet.As<IQueryable<User>>().Setup(m => m.Expression).Returns(users.Expression);
        usersDbSet.As<IQueryable<User>>().Setup(m => m.ElementType).Returns(users.ElementType);
        usersDbSet.As<IQueryable<User>>().Setup(m => m.GetEnumerator()).Returns(users.GetEnumerator());

        mockContext.Setup(c => c.Users).Returns(usersDbSet.Object);

        var service = new RankingsService(mockContext.Object);

        // Act
        var result = await service.GetPokedexRanking("INVALIDREGION");

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetAllRankings_ShouldReturnRankingsForAllPokedexes()
    {
        // Arrange - Use in-memory database context for proper Include/ThenInclude support
        var options = new DbContextOptionsBuilder<PokeInfoDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using var context = new PokeInfoDbContext(options);

        // Create a role
        var userRole = new Role { Id = RoleService.UserRoleId, Name = "User" };
        context.Roles.Add(userRole);

        // Create a ranked user with a collection (but no Pokémon for simplicity)
        var rankedUser = new User
        {
            Id = 1,
            Username = "ranked_user",
            Email = "ranked@test.com",
            PasswordHash = "hash123",
            RoleId = RoleService.UserRoleId,
            Role = userRole,
            Ranked = 1,
            Collections = new List<Collection>
            {
                new Collection
                {
                    Id = 1,
                    UserId = 1,
                    Name = "Test Collection",
                    CollectionPokemons = new List<CollectionPokemon>()
                }
            }
        };

        context.Users.Add(rankedUser);
        context.SaveChanges();

        var service = new RankingsService(context);

        // Act
        var result = await service.GetAllRankings();

        // Assert
        Assert.NotNull(result);
        // Should have 10 rankings (one for each Pokédex region)
        Assert.Equal(10, result.Count);

        // Verify that all expected Pokédex regions are present
        var regionNames = result.Select(r => r.PokedexName).ToList();
        Assert.Contains("Kanto", regionNames);
        Assert.Contains("Johto", regionNames);
        Assert.Contains("Hoenn", regionNames);
        Assert.Contains("Sinnoh", regionNames);
        Assert.Contains("Unova", regionNames);
        Assert.Contains("Kalos", regionNames);
        Assert.Contains("Alola", regionNames);
        Assert.Contains("Galar", regionNames);
        Assert.Contains("Paldea", regionNames);
        Assert.Contains("Hisui", regionNames);
    }
}

/// <summary>
/// Helper class for async enumeration in tests
/// </summary>
public class AsyncEnumerator<T> : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _enumerator;

    public AsyncEnumerator(IEnumerator<T> enumerator)
    {
        _enumerator = enumerator;
    }

    public T Current => _enumerator.Current;

    public async ValueTask<bool> MoveNextAsync()
    {
        return await Task.FromResult(_enumerator.MoveNext());
    }

    public async ValueTask DisposeAsync()
    {
        await Task.CompletedTask;
        _enumerator.Dispose();
    }
}
