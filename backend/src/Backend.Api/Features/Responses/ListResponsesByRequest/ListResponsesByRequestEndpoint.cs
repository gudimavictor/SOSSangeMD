using System.Security.Claims;
using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Auth;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Responses.ListResponsesByRequest;

public record DonorContactResponse(
    int Id,
    int DonorId,
    string DonorName,
    BloodType? DonorBloodType,
    string DonorPhone,
    ResponseStatus Status,
    DateTime RespondedAt);

public enum ListResponsesByRequestStatus
{
    Success,
    NotFound,
    Forbidden
}

public record ListResponsesByRequestResult(
    ListResponsesByRequestStatus Status,
    IReadOnlyList<DonorContactResponse>? Responses = null)
{
    public static ListResponsesByRequestResult Success(IReadOnlyList<DonorContactResponse> responses) =>
        new(ListResponsesByRequestStatus.Success, responses);

    public static ListResponsesByRequestResult NotFound() => new(ListResponsesByRequestStatus.NotFound);
    public static ListResponsesByRequestResult Forbidden() => new(ListResponsesByRequestStatus.Forbidden);
}

public class ListResponsesByRequestHandler(AppDbContext db)
{
    public async Task<ListResponsesByRequestResult> Handle(int requestId, int callerId, bool callerIsAdmin,
        CancellationToken cancellationToken)
    {
        var bloodRequest = await db.BloodRequests.FirstOrDefaultAsync(r => r.Id == requestId, cancellationToken);
        if (bloodRequest is null)
        {
            return ListResponsesByRequestResult.NotFound();
        }

        if (bloodRequest.RequesterId != callerId && !callerIsAdmin)
        {
            return ListResponsesByRequestResult.Forbidden();
        }

        var responses = await db.RequestResponses
            .Where(r => r.BloodRequestId == requestId)
            .OrderByDescending(r => r.RespondedAt)
            .Select(r => new DonorContactResponse(r.Id, r.DonorId, r.Donor.Name, r.Donor.BloodType, r.Donor.Phone,
                r.Status, r.RespondedAt))
            .ToListAsync(cancellationToken);

        return ListResponsesByRequestResult.Success(responses);
    }
}

public class ListResponsesByRequestEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/responses/by-request/{requestId:int}",
                async (int requestId, ClaimsPrincipal caller, ListResponsesByRequestHandler handler,
                    CancellationToken ct) =>
                {
                    var result = await handler.Handle(requestId, caller.GetUserId(), caller.IsAdmin(), ct);
                    return result.Status switch
                    {
                        ListResponsesByRequestStatus.Success => Results.Ok(result.Responses),
                        ListResponsesByRequestStatus.NotFound => Results.NotFound(),
                        ListResponsesByRequestStatus.Forbidden => Results.Forbid(),
                        _ => Results.Problem()
                    };
                })
            .RequireAuthorization()
            .WithName("ListResponsesByRequest")
            .WithTags("Responses")
            .Produces<IReadOnlyList<DonorContactResponse>>()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
    }
}
