using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Responses.GetResponseById;

public record DonorResponse(
    int Id,
    int BloodRequestId,
    int DonorId,
    string DonorName,
    ResponseStatus Status,
    DateTime RespondedAt);

public class GetResponseByIdHandler(AppDbContext db)
{
    public async Task<DonorResponse?> Handle(int id, CancellationToken cancellationToken)
    {
        return await db.RequestResponses
            .Where(r => r.Id == id)
            .Select(r => new DonorResponse(r.Id, r.BloodRequestId, r.DonorId, r.Donor.Name, r.Status, r.RespondedAt))
            .FirstOrDefaultAsync(cancellationToken);
    }
}

public class GetResponseByIdEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/responses/get/{id:int}",
                async (int id, GetResponseByIdHandler handler, CancellationToken ct) =>
                {
                    var response = await handler.Handle(id, ct);
                    return response is not null ? Results.Ok(response) : Results.NotFound();
                })
            .WithName("GetResponseById")
            .WithTags("Responses")
            .Produces<DonorResponse>()
            .Produces(StatusCodes.Status404NotFound);
    }
}
