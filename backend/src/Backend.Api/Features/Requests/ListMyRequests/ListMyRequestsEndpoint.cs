using System.Security.Claims;
using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Auth;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Requests.ListMyRequests;

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

public class ListMyRequestsHandler(AppDbContext db)
{
    public async Task<IReadOnlyList<BloodRequestResponse>> Handle(int requesterId, CancellationToken cancellationToken)
    {
        return await db.BloodRequests
            .Where(r => r.RequesterId == requesterId)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new BloodRequestResponse(r.Id, r.RequesterId, r.Requester.Name, r.RequiredBloodType, r.City,
                r.Urgency, r.Description, r.Status, r.CreatedAt))
            .ToListAsync(cancellationToken);
    }
}

public class ListMyRequestsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/requests/mine", async (ClaimsPrincipal caller, ListMyRequestsHandler handler,
                CancellationToken ct) =>
            {
                var requests = await handler.Handle(caller.GetUserId(), ct);
                return Results.Ok(requests);
            })
            .RequireAuthorization()
            .WithName("ListMyRequests")
            .WithTags("Requests")
            .Produces<IReadOnlyList<BloodRequestResponse>>()
            .Produces(StatusCodes.Status401Unauthorized);
    }
}
