namespace Backend.Api.Domain.Entities;

public class TransfusionCenter
{
    public int Id { get; set; }
    public string Name { get; set; } = default!;
    public string City { get; set; } = default!;
    public string Address { get; set; } = default!;
    public string Phone { get; set; } = default!;
    public string Schedule { get; set; } = default!;
    public double Lat { get; set; }
    public double Lng { get; set; }
}
