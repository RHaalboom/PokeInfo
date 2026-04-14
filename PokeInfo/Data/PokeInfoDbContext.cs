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
}