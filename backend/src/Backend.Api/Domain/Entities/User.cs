using Backend.Api.Domain.Enums;

namespace Backend.Api.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Nume { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Telefon { get; set; } = default!;
    public string Oras { get; set; } = default!;
    public int? Varsta { get; set; }
    public bool EsteDonator { get; set; }
    public bool EsteAdmin { get; set; }
    public GrupaSanguina? GrupaSanguina { get; set; }
    public DateOnly? DataUltimeiDonari { get; set; }
    public string ParolaHash { get; set; } = default!;
}
