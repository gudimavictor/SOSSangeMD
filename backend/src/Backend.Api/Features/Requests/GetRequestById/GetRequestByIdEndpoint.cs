using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Requests.GetRequestById;

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

public class GetRequestByIdHandler(AppDbContext db)
{
    public async Task<BloodRequestResponse?> Handle(int id, CancellationToken cancellationToken)
    {
        return await db.BloodRequests
            .Where(r => r.Id == id)
            .Select(r => new BloodRequestResponse(r.Id, r.SolicitantId, r.Solicitant.Nume, r.GrupaNecesara, r.Oras,
                r.Urgenta, r.Descriere, r.Status, r.DataCreare))
            .FirstOrDefaultAsync(cancellationToken);
    }
}

public class GetRequestByIdEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/requests/get/{id:int}",
                async (int id, GetRequestByIdHandler handler, CancellationToken ct) =>
                {
                    var request = await handler.Handle(id, ct);
                    return request is not null ? Results.Ok(request) : Results.NotFound();
                })
            .WithName("GetRequestById")
            .WithTags("Requests")
            .Produces<BloodRequestResponse>()
            .Produces(StatusCodes.Status404NotFound);
    }
}
