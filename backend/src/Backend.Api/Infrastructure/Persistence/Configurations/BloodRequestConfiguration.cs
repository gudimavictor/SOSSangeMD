using Backend.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Infrastructure.Persistence.Configurations;

public class BloodRequestConfiguration : IEntityTypeConfiguration<BloodRequest>
{
    public void Configure(EntityTypeBuilder<BloodRequest> builder)
    {
        builder.HasKey(r => r.Id);

        builder.Property(r => r.GrupaNecesara).HasConversion<string>().HasMaxLength(10);
        builder.Property(r => r.Oras).HasMaxLength(100).IsRequired();
        builder.Property(r => r.Urgenta).HasConversion<string>().HasMaxLength(20);
        builder.Property(r => r.Descriere).HasMaxLength(1000).IsRequired();
        builder.Property(r => r.Status).HasConversion<string>().HasMaxLength(20);

        builder.HasOne(r => r.Solicitant)
            .WithMany()
            .HasForeignKey(r => r.SolicitantId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
