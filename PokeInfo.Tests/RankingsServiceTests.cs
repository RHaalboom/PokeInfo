using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using PokeInfo.Entities;
using PokeInfo.Services;
using PokeInfo.Data;
using System.Linq.Expressions;

namespace PokeInfo.Tests;

public class RankingsServiceTests
{
    [Fact(Skip = "Requires Entity Framework In-Memory provider or database context to properly mock Include/ThenInclude chains")]
    public async Task GetPokedexRanking_ShouldOnlyIncludeRankedUserAndModeratorRoles()
    {
        // Arrange - This test verifies the role filtering logic
        // We're testing that users with Ranked=1 or Moderator/Admin roles are included
        // The Include().ThenInclude() calls in the service will return empty collections,
        // but we can still verify the filtering works
        var userRole = new Role { Id = RoleService.UserRoleId, Name = "User" };
        var moderatorRole = new Role { Id = RoleService.ModeratorRoleId, Name = "Moderator" };

        var users = new List<User>
        {
            new User 
            { 
                Id = 1, 
                Username = "ranked_user", 
                RoleId = RoleService.UserRoleId, 
                Role = userRole, 
                Ranked = 1, 
                Collections = new List<Collection>()
            },
            new User 
            { 
                Id = 2, 
                Username = "regular_user", 
                RoleId = RoleService.UserRoleId, 
                Role = userRole, 
                Ranked = null, 
                Collections = new List<Collection>()
            },
            new User 
            { 
                Id = 3, 
                Username = "moderator", 
                RoleId = RoleService.ModeratorRoleId, 
                Role = moderatorRole, 
                Ranked = null, 
                Collections = new List<Collection>()
            }
        };

        var mockContext = new Mock<IPokeInfoDbContext>();
        var queryable = users.AsQueryable();
        var mockDbSet = new Mock<DbSet<User>>();

        // Set up the basic LINQ queryable support
        mockDbSet.As<IQueryable<User>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockDbSet.As<IQueryable<User>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockDbSet.As<IQueryable<User>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockDbSet.As<IQueryable<User>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());

        // Set up async support for ToListAsync()
        mockDbSet.As<IAsyncEnumerable<User>>().Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
            .Returns(() => new AsyncEnumerator<User>(queryable.GetEnumerator()));

        mockContext.Setup(c => c.Users).Returns(mockDbSet.Object);

        var service = new RankingsService(mockContext.Object);

        // Act
        var result = await service.GetPokedexRanking("KANTO");

        // Assert
        Assert.NotNull(result);
        // Only users with Ranked=1 or role ID 2 (Moderator) or 3 (Admin) should be included
        // That's: ranked_user (Ranked=1) and moderator (RoleId=2)
        Assert.Equal(2, result.Rankings.Count);
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

    [Fact(Skip = "Requires Entity Framework In-Memory provider or database context to properly mock Include/ThenInclude chains")]
    public async Task GetAllRankings_ShouldReturnRankingsForAllPokedexes()
    {
        // Arrange - Empty list to avoid Include chain issues
        var mockContext = new Mock<IPokeInfoDbContext>();
        var users = new List<User>();
        var queryable = users.AsQueryable();
        var mockDbSet = new Mock<DbSet<User>>();

        mockDbSet.As<IQueryable<User>>().Setup(m => m.Provider).Returns(queryable.Provider);
        mockDbSet.As<IQueryable<User>>().Setup(m => m.Expression).Returns(queryable.Expression);
        mockDbSet.As<IQueryable<User>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
        mockDbSet.As<IQueryable<User>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());
        mockDbSet.As<IAsyncEnumerable<User>>().Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
            .Returns(() => new AsyncEnumerator<User>(queryable.GetEnumerator()));

        mockContext.Setup(c => c.Users).Returns(mockDbSet.Object);

        var service = new RankingsService(mockContext.Object);

        // Act
        var result = await service.GetAllRankings();

        // Assert
        Assert.NotNull(result);
        // Should have 10 empty rankings (one for each Pokédex region) since we have no users
        Assert.Equal(10, result.Count);
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
