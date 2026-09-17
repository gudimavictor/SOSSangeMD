namespace Backend.Api.Domain.Entities;

public class EmailVerificationCode
{
    public int Id { get; set; }
    public string Email { get; set; } = default!;
    public string Code { get; set; } = default!;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }

    public bool IsActive => ConfirmedAt is null && DateTime.UtcNow < ExpiresAt;
}
