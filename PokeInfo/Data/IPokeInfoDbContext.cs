using Microsoft.EntityFrameworkCore;
using PokeInfo.Entities;

namespace PokeInfo.Data;

/// <summary>
/// Interface for PokeInfoDbContext to enable mocking and testability.
/// This abstraction allows unit tests to mock database operations without needing
/// a real database connection or complex test setup.
/// </summary>
public interface IPokeInfoDbContext
{
    /// <summary>
    /// DbSet for User entities.
    /// Used for querying and managing users in the database.
    /// </summary>
    DbSet<User> Users { get; }

    /// <summary>
    /// DbSet for Role entities.
    /// Used for querying and managing roles in the database.
    /// </summary>
    DbSet<Role> Roles { get; }

    /// <summary>
    /// DbSet for Collection entities.
    /// Used for querying and managing collections in the database.
    /// </summary>
    DbSet<Collection> Collections { get; }

    /// <summary>
    /// DbSet for CollectionPokemon entities.
    /// Used for querying and managing collection Pokemon associations in the database.
    /// </summary>
    DbSet<CollectionPokemon> CollectionPokemons { get; }

    /// <summary>
    /// Asynchronously saves all changes made in this context to the database.
    /// </summary>
    /// <param name="cancellationToken">A CancellationToken to observe while waiting for the task to complete.</param>
    /// <returns>A task that represents the asynchronous save operation. The task result contains the number of state entries written to the database.</returns>
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
