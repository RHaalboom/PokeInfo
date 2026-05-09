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
    }
}
