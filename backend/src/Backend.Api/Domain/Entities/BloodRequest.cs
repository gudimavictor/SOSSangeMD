using Backend.Api.Domain.Enums;

namespace Backend.Api.Domain.Entities;

public class BloodRequest
{
    public int Id { get; set; }
    public int RequesterId { get; set; }
    public User Requester { get; set; } = default!;
    public BloodType RequiredBloodType { get; set; }
    public string City { get; set; } = default!;
    public UrgencyLevel Urgency { get; set; }
    public string Description { get; set; } = default!;
    public RequestStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}
