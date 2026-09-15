using Backend.Api.Domain.Enums;

namespace Backend.Api.Domain.Entities;

public class BloodRequest
{
    public int Id { get; set; }
    public int SolicitantId { get; set; }
    public User Solicitant { get; set; } = default!;
    public GrupaSanguina GrupaNecesara { get; set; }
    public string Oras { get; set; } = default!;
    public NivelUrgenta Urgenta { get; set; }
    public string Descriere { get; set; } = default!;
    public StatusCerere Status { get; set; }
    public DateTime DataCreare { get; set; }
}
