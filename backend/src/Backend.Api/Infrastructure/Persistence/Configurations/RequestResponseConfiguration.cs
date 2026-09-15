using Backend.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Infrastructure.Persistence.Configurations;

public class RequestResponseConfiguration : IEntityTypeConfiguration<RequestResponse>
{
    public void Configure(EntityTypeBuilder<RequestResponse> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(r => r.BloodRequest)
            .WithMany()
            .HasForeignKey(r => r.BloodRequestId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(r => r.Donator)
            .WithMany()
            .HasForeignKey(r => r.DonatorId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(r => new { r.BloodRequestId, r.DonatorId }).IsUnique();
    }
}
