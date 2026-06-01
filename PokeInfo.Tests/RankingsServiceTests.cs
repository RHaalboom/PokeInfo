using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using PokeInfo.Entities;
using PokeInfo.Services;
using PokeInfo.Data;

namespace PokeInfo.Tests;

public class RankingsServiceTests
{
    [Fact]
    public async Task GetPokedexRanking_ShouldOnlyIncludeRankedUserAndModeratorRoles()
    {
        // Arrange
        var kantoRole = new Role { Id = 2, Name = "RankedUser" };
        var regularUserRole = new Role { Id = 1, Name = "User" };
        var moderatorRole = new Role { Id = 3, Name = "Moderator" };

        var users = new List<User>
        {
            new User { Id = 1, Username = "ranked_user", RoleId = 2, Role = kantoRole, Collections = new() },
            new User { Id = 2, Username = "regular_user", RoleId = 1, Role = regularUserRole, Collections = new() },
            new User { Id = 3, Username = "moderator", RoleId = 3, Role = moderatorRole, Collections = new() }
        };

        var mockContext = new Mock<IPokeInfoDbContext>();
        var usersDbSet = new Mock<DbSet<User>>();

        var usersQueryable = users.AsQueryable();
        usersDbSet.As<IQueryable<User>>().Setup(m => m.Provider).Returns(usersQueryable.Provider);
        usersDbSet.As<IQueryable<User>>().Setup(m => m.Expression).Returns(usersQueryable.Expression);
        usersDbSet.As<IQueryable<User>>().Setup(m => m.ElementType).Returns(usersQueryable.ElementType);
        usersDbSet.As<IQueryable<User>>().Setup(m => m.GetEnumerator()).Returns(usersQueryable.GetEnumerator());
        usersDbSet.As<IAsyncEnumerable<User>>()
            .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
            .Returns(new AsyncEnumerator<User>(usersQueryable.GetEnumerator()));

        mockContext.Setup(c => c.Users).Returns(usersDbSet.Object);

        var service = new RankingsService(mockContext.Object);

        // Act
        var result = await service.GetPokedexRanking("KANTO");

        // Assert
        Assert.NotNull(result);
        Assert.Equal(2, result.Rankings.Count); // Only ranked user and moderator
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
        var result = await service.GetAllRankings();

        // Assert
        Assert.NotNull(result);
        Assert.Equal(10, result.Count); // Should have one entry for each of the 10 Pokédex regions
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
