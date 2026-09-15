using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Requests.ListRequests;

public record BloodRequestResponse(
    int Id,
    int SolicitantId,
    string SolicitantNume,
    GrupaSanguina GrupaNecesara,
    string Oras,
    NivelUrgenta Urgenta,
    string Descriere,
    StatusCerere Status,
    DateTime DataCreare);

public class ListRequestsHandler(AppDbContext db)
{
    public async Task<IReadOnlyList<BloodRequestResponse>> Handle(CancellationToken cancellationToken)
    {
        return await db.BloodRequests
            .OrderByDescending(r => r.DataCreare)
            .Select(r => new BloodRequestResponse(r.Id, r.SolicitantId, r.Solicitant.Nume, r.GrupaNecesara, r.Oras,
                r.Urgenta, r.Descriere, r.Status, r.DataCreare))
            .ToListAsync(cancellationToken);
    }
}

public class ListRequestsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/requests/list", async (ListRequestsHandler handler, CancellationToken ct) =>
            {
                var requests = await handler.Handle(ct);
                return Results.Ok(requests);
            })
            .WithName("ListRequests")
            .WithTags("Requests")
            .Produces<IReadOnlyList<BloodRequestResponse>>();
    }
}
