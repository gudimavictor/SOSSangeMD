namespace Backend.Api.Domain.Entities;

public class SupportMessage
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = default!;
    public string Message { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public string? Reply { get; set; }
    public DateTime? RepliedAt { get; set; }
}
