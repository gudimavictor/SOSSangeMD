using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Requests.GetRequestById;

public record BloodRequestResponse(
    int Id,
    int RequesterId,
    string RequesterName,
    BloodType RequiredBloodType,
    string City,
    UrgencyLevel Urgency,
    string Description,
    RequestStatus Status,
    DateTime CreatedAt);

public class GetRequestByIdHandler(AppDbContext db)
{
    public async Task<BloodRequestResponse?> Handle(int id, CancellationToken cancellationToken)
    {
        return await db.BloodRequests
            .Where(r => r.Id == id)
            .Select(r => new BloodRequestResponse(r.Id, r.RequesterId, r.Requester.Name, r.RequiredBloodType, r.City,
                r.Urgency, r.Description, r.Status, r.CreatedAt))
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
            .RequireAuthorization()
            .WithName("GetRequestById")
            .WithTags("Requests")
            .Produces<BloodRequestResponse>()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized);
    }
}
