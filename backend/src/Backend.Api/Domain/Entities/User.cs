using Backend.Api.Domain.Enums;

namespace Backend.Api.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string City { get; set; } = default!;
    public int? Age { get; set; }
    public bool IsDonor { get; set; }
    public bool IsAdmin { get; set; }
    public BloodType? BloodType { get; set; }
    public DateOnly? LastDonationDate { get; set; }
    public string PasswordHash { get; set; } = default!;
}
