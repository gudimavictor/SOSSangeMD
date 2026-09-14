using Backend.Api.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Backend.Api.Infrastructure.Persistence.Configurations;

public class TransfusionCenterConfiguration : IEntityTypeConfiguration<TransfusionCenter>
{
    public void Configure(EntityTypeBuilder<TransfusionCenter> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id).HasMaxLength(64);
        builder.Property(c => c.Nume).HasMaxLength(200).IsRequired();
        builder.Property(c => c.Oras).HasMaxLength(100).IsRequired();
        builder.Property(c => c.Adresa).HasMaxLength(300).IsRequired();
        builder.Property(c => c.Telefon).HasMaxLength(30).IsRequired();
        builder.Property(c => c.Program).HasMaxLength(200).IsRequired();

        builder.HasData(
            new TransfusionCenter
            {
                Id = "chisinau",
                Nume = "Centrul Național de Transfuzie a Sângelui",
                Oras = "Chișinău",
                Adresa = "Str. Academiei 11, Chișinău",
                Telefon = "+373 22 727 511",
                Program = "Luni–Vineri, 08:00–15:00",
                Lat = 47.0159,
                Lng = 28.8419
            },
            new TransfusionCenter
            {
                Id = "balti",
                Nume = "Centrul Național de Transfuzie a Sângelui — filiala Bălți",
                Oras = "Bălți",
                Adresa = "Str. Decebal 113, Bălți",
                Telefon = "+373 231 22 555",
                Program = "Luni–Vineri, 08:00–14:00",
                Lat = 47.7561,
                Lng = 27.9298
            },
            new TransfusionCenter
            {
                Id = "cahul",
                Nume = "Cabinet de Transfuzie a Sângelui — Spitalul Raional Cahul",
                Oras = "Cahul",
                Adresa = "IMSP Spitalul Raional Cahul",
                Telefon = "+373 299 22 555",
                Program = "Luni–Vineri, 08:00–14:00",
                Lat = 45.9075,
                Lng = 28.1936
            },
            new TransfusionCenter
            {
                Id = "soroca",
                Nume = "Cabinet de Transfuzie a Sângelui — Spitalul Raional Soroca \"A. Prisăcari\"",
                Oras = "Soroca",
                Adresa = "IMSP Spitalul Raional Soroca",
                Telefon = "+373 230 22 555",
                Program = "Luni–Vineri, 08:00–14:00",
                Lat = 48.1567,
                Lng = 28.2939
            },
            new TransfusionCenter
            {
                Id = "comrat",
                Nume = "Cabinet de Transfuzie a Sângelui — Spitalul Raional Comrat \"Isaac Gurfinchel\"",
                Oras = "Comrat",
                Adresa = "Str. Odesscaia 2, Comrat",
                Telefon = "+373 298 22 555",
                Program = "Luni–Vineri, 08:00–14:00",
                Lat = 46.3021,
                Lng = 28.6567
            }
        );
    }
}
