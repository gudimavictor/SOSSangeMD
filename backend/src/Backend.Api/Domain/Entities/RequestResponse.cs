using Backend.Api.Domain.Enums;

namespace Backend.Api.Domain.Entities;

public class RequestResponse
{
    public int Id { get; set; }
    public int BloodRequestId { get; set; }
    public BloodRequest BloodRequest { get; set; } = default!;
    public int DonorId { get; set; }
    public User Donor { get; set; } = default!;
    public ResponseStatus Status { get; set; }
    public DateTime RespondedAt { get; set; }
}
