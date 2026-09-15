using Backend.Api.Domain.Enums;

namespace Backend.Api.Domain.Entities;

public class RequestResponse
{
    public int Id { get; set; }
    public int BloodRequestId { get; set; }
    public BloodRequest BloodRequest { get; set; } = default!;
    public int DonatorId { get; set; }
    public User Donator { get; set; } = default!;
    public StatusRaspuns Status { get; set; }
    public DateTime Data { get; set; }
}
