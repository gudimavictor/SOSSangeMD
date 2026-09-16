using System.Security.Claims;
using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Auth;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Notifications.MarkAsRead;

public record NotificationResponse(
    int Id,
    int UserId,
    NotificationType Type,
    string Title,
    string Message,
    bool IsRead,
    DateTime CreatedAt,
    string? Link);

public enum MarkAsReadStatus
{
    Success,
    NotFound,
    Forbidden
}

public record MarkAsReadResult(MarkAsReadStatus Status, NotificationResponse? Response = null)
{
    public static MarkAsReadResult Success(NotificationResponse response) => new(MarkAsReadStatus.Success, response);
    public static MarkAsReadResult NotFound() => new(MarkAsReadStatus.NotFound);
    public static MarkAsReadResult Forbidden() => new(MarkAsReadStatus.Forbidden);
}

public class MarkAsReadHandler(AppDbContext db)
{
    public async Task<MarkAsReadResult> Handle(int id, int callerId, bool callerIsAdmin,
        CancellationToken cancellationToken)
    {
        var entity = await db.Notifications.FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
        if (entity is null)
        {
            return MarkAsReadResult.NotFound();
        }

        if (entity.UserId != callerId && !callerIsAdmin)
        {
            return MarkAsReadResult.Forbidden();
        }

        entity.IsRead = true;
        await db.SaveChangesAsync(cancellationToken);

        var response = new NotificationResponse(entity.Id, entity.UserId, entity.Type, entity.Title, entity.Message,
            entity.IsRead, entity.CreatedAt, entity.Link);
        return MarkAsReadResult.Success(response);
    }
}

public class MarkAsReadEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/notifications/mark-read/{id:int}",
                async (int id, ClaimsPrincipal caller, MarkAsReadHandler handler, CancellationToken ct) =>
                {
                    var result = await handler.Handle(id, caller.GetUserId(), caller.IsAdmin(), ct);
                    return result.Status switch
                    {
                        MarkAsReadStatus.Success => Results.Ok(result.Response),
                        MarkAsReadStatus.NotFound => Results.NotFound(),
                        MarkAsReadStatus.Forbidden => Results.Forbid(),
                        _ => Results.Problem()
                    };
                })
            .RequireAuthorization()
            .WithName("MarkAsRead")
            .WithTags("Notifications")
            .Produces<NotificationResponse>()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
    }
}
