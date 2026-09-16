using Backend.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<TransfusionCenter> TransfusionCenters => Set<TransfusionCenter>();
    public DbSet<User> Users => Set<User>();
    public DbSet<BloodRequest> BloodRequests => Set<BloodRequest>();
    public DbSet<RequestResponse> RequestResponses => Set<RequestResponse>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
