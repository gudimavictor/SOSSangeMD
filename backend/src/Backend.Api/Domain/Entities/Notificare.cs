using Backend.Api.Domain.Enums;

namespace Backend.Api.Domain.Entities;

public class Notificare
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = default!;
    public TipNotificare Tip { get; set; }
    public string Titlu { get; set; } = default!;
    public string Mesaj { get; set; } = default!;
    public bool Citita { get; set; }
    public DateTime Data { get; set; }
    public string? Link { get; set; }
}
