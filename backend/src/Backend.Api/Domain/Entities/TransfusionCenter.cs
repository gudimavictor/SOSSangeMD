namespace Backend.Api.Domain.Entities;

public class TransfusionCenter
{
    public int Id { get; set; }

    public string Nume { get; set; } = default!;
    public string Oras { get; set; } = default!;
    public string Adresa { get; set; } = default!;
    public string Telefon { get; set; } = default!;
    public string Program { get; set; } = default!;
    public double Lat { get; set; }
    public double Lng { get; set; }
}
