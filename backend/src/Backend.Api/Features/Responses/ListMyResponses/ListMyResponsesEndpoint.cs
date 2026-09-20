using System.Security.Claims;
using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Auth;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Responses.ListMyResponses;

public record MyResponseResponse(
    int Id,
    int BloodRequestId,
    int RequesterId,
    string RequesterName,
    string RequesterPhone,
    ResponseStatus Status,
    DateTime RespondedAt);

public class ListMyResponsesHandler(AppDbContext db)
{
    public async Task<IReadOnlyList<MyResponseResponse>> Handle(int donorId, CancellationToken cancellationToken)
    {
        return await db.RequestResponses
            .Where(r => r.DonorId == donorId)
            .OrderByDescending(r => r.RespondedAt)
            .Select(r => new MyResponseResponse(r.Id, r.BloodRequestId, r.BloodRequest.RequesterId,
                r.BloodRequest.Requester.Name, r.BloodRequest.Requester.Phone, r.Status, r.RespondedAt))
            .ToListAsync(cancellationToken);
    }
}

public class ListMyResponsesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/responses/mine", async (ClaimsPrincipal caller, ListMyResponsesHandler handler,
                CancellationToken ct) =>
            {
                var responses = await handler.Handle(caller.GetUserId(), ct);
                return Results.Ok(responses);
            })
            .RequireAuthorization()
            .WithName("ListMyResponses")
            .WithTags("Responses")
            .Produces<IReadOnlyList<MyResponseResponse>>()
            .Produces(StatusCodes.Status401Unauthorized);
    }
}
