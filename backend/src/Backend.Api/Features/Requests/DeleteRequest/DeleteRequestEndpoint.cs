using System.Security.Claims;
using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Auth;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Requests.DeleteRequest;

public enum DeleteRequestStatus
{
    Success,
    NotFound,
    Forbidden
}

public class DeleteRequestHandler(AppDbContext db)
{
    public async Task<DeleteRequestStatus> Handle(int id, int callerId, bool callerIsAdmin,
        CancellationToken cancellationToken)
    {
        var entity = await db.BloodRequests.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        if (entity is null)
        {
            return DeleteRequestStatus.NotFound;
        }

        if (entity.RequesterId != callerId && !callerIsAdmin)
        {
            return DeleteRequestStatus.Forbidden;
        }

        db.BloodRequests.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);

        return DeleteRequestStatus.Success;
    }
}

public class DeleteRequestEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/requests/delete/{id:int}",
                async (int id, ClaimsPrincipal caller, DeleteRequestHandler handler, CancellationToken ct) =>
                {
                    var status = await handler.Handle(id, caller.GetUserId(), caller.IsAdmin(), ct);
                    return status switch
                    {
                        DeleteRequestStatus.Success => Results.NoContent(),
                        DeleteRequestStatus.NotFound => Results.NotFound(),
                        DeleteRequestStatus.Forbidden => Results.Forbid(),
                        _ => Results.Problem()
                    };
                })
            .RequireAuthorization()
            .WithName("DeleteRequest")
            .WithTags("Requests")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
    }
}
