using Backend.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Infrastructure.Persistence.Configurations;

public class TransfusionCenterConfiguration : IEntityTypeConfiguration<TransfusionCenter>
{
    public void Configure(EntityTypeBuilder<TransfusionCenter> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Name).HasMaxLength(200).IsRequired();
        builder.Property(c => c.City).HasMaxLength(100).IsRequired();
        builder.Property(c => c.Address).HasMaxLength(300).IsRequired();
        builder.Property(c => c.Phone).HasMaxLength(30).IsRequired();
        builder.Property(c => c.Schedule).HasMaxLength(200).IsRequired();

        builder.HasData(
            new TransfusionCenter
            {
                Id = 1,
                Name = "Centrul Național de Transfuzie a Sângelui",
                City = "Chișinău",
                Address = "Str. Academiei 11, Chișinău",
                Phone = "+373 22 727 511",
                Schedule = "Luni–Vineri, 08:00–15:00",
                Lat = 47.0159,
                Lng = 28.8419
            },
            new TransfusionCenter
            {
                Id = 2,
                Name = "Centrul Național de Transfuzie a Sângelui — filiala Bălți",
                City = "Bălți",
                Address = "Str. Decebal 113, Bălți",
                Phone = "+373 231 22 555",
                Schedule = "Luni–Vineri, 08:00–14:00",
                Lat = 47.7561,
                Lng = 27.9298
            },
            new TransfusionCenter
            {
                Id = 3,
                Name = "Cabinet de Transfuzie a Sângelui — Spitalul Raional Cahul",
                City = "Cahul",
                Address = "IMSP Spitalul Raional Cahul",
                Phone = "+373 299 22 555",
                Schedule = "Luni–Vineri, 08:00–14:00",
                Lat = 45.9075,
                Lng = 28.1936
            },
            new TransfusionCenter
            {
                Id = 4,
                Name = "Cabinet de Transfuzie a Sângelui — Spitalul Raional Soroca \"A. Prisăcari\"",
                City = "Soroca",
                Address = "IMSP Spitalul Raional Soroca",
                Phone = "+373 230 22 555",
                Schedule = "Luni–Vineri, 08:00–14:00",
                Lat = 48.1567,
                Lng = 28.2939
            },
            new TransfusionCenter
            {
                Id = 5,
                Name = "Cabinet de Transfuzie a Sângelui — Spitalul Raional Comrat \"Isaac Gurfinchel\"",
                City = "Comrat",
                Address = "Str. Odesscaia 2, Comrat",
                Phone = "+373 298 22 555",
                Schedule = "Luni–Vineri, 08:00–14:00",
                Lat = 46.3021,
                Lng = 28.6567
            }
        );
    }
}
