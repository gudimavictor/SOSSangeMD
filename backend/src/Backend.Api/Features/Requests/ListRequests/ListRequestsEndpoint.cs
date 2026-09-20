using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Requests.ListRequests;

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

public class ListRequestsHandler(AppDbContext db)
{
    public async Task<IReadOnlyList<BloodRequestResponse>> Handle(CancellationToken cancellationToken)
    {
        return await db.BloodRequests
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new BloodRequestResponse(r.Id, r.RequesterId, r.Requester.Name, r.RequiredBloodType, r.City,
                r.Urgency, r.Description, r.Status, r.CreatedAt))
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
            .AllowAnonymous()
            .WithName("ListRequests")
            .WithTags("Requests")
            .Produces<IReadOnlyList<BloodRequestResponse>>();
    }
}
