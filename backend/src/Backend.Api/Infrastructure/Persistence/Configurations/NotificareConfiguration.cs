using Backend.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Infrastructure.Persistence.Configurations;

public class NotificareConfiguration : IEntityTypeConfiguration<Notificare>
{
    public void Configure(EntityTypeBuilder<Notificare> builder)
    {
        builder.HasKey(n => n.Id);

        builder.Property(n => n.Tip).HasConversion<string>().HasMaxLength(30);
        builder.Property(n => n.Titlu).HasMaxLength(200).IsRequired();
        builder.Property(n => n.Mesaj).HasMaxLength(1000).IsRequired();
        builder.Property(n => n.Link).HasMaxLength(200);

        builder.HasOne(n => n.User)
            .WithMany()
            .HasForeignKey(n => n.UserId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
