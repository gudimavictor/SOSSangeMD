using Backend.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Name).HasMaxLength(200).IsRequired();
        builder.Property(u => u.Email).HasMaxLength(320).IsRequired();
        builder.Property(u => u.Phone).HasMaxLength(30).IsRequired();
        builder.Property(u => u.City).HasMaxLength(100).IsRequired();
        builder.Property(u => u.BloodType).HasConversion<string>().HasMaxLength(10);
        builder.Property(u => u.PasswordHash).HasMaxLength(500).IsRequired();

        builder.HasIndex(u => u.Email).IsUnique();
    }
}
