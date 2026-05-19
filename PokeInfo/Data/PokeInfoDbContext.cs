using Microsoft.EntityFrameworkCore;
using PokeInfo.Entities;

namespace PokeInfo.Data;

public class PokeInfoDbContext : DbContext
{
    public PokeInfoDbContext(DbContextOptions<PokeInfoDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Collection> Collections => Set<Collection>();
    public DbSet<CollectionPokemon> CollectionPokemons => Set<CollectionPokemon>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Seed default roles
        modelBuilder.Entity<Role>().HasData(
            new Role { Id = 1, Name = "User", Description = "Standard user role without rankings" },
            new Role { Id = 2, Name = "RankedUser", Description = "User role with access to rankings" },
            new Role { Id = 3, Name = "Moderator", Description = "Moderator role with access to all accounts" }
        );

        // Configure relationships
        modelBuilder.Entity<User>()
            .HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Collection>()
            .HasOne(c => c.User)
            .WithMany(u => u.Collections)
            .HasForeignKey(c => c.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<CollectionPokemon>()
            .HasOne(cp => cp.Collection)
            .WithMany(c => c.CollectionPokemons)
            .HasForeignKey(cp => cp.CollectionId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
