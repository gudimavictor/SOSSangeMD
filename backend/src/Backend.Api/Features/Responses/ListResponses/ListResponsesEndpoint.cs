using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Responses.ListResponses;

public record DonorResponse(
    int Id,
    int BloodRequestId,
    int DonatorId,
    string DonatorNume,
    StatusRaspuns Status,
    DateTime Data);

public class ListResponsesHandler(AppDbContext db)
{
    public async Task<IReadOnlyList<DonorResponse>> Handle(CancellationToken cancellationToken)
    {
        return await db.RequestResponses
            .OrderByDescending(r => r.Data)
            .Select(r => new DonorResponse(r.Id, r.BloodRequestId, r.DonatorId, r.Donator.Nume, r.Status, r.Data))
            .ToListAsync(cancellationToken);
    }
}

public class ListResponsesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/responses/list", async (ListResponsesHandler handler, CancellationToken ct) =>
            {
                var responses = await handler.Handle(ct);
                return Results.Ok(responses);
            })
            .WithName("ListResponses")
            .WithTags("Responses")
            .Produces<IReadOnlyList<DonorResponse>>();
    }
}
