using System.Security.Claims;
using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Auth;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Notifications.MarkAllAsRead;

public class MarkAllAsReadHandler(AppDbContext db)
{
    public async Task<int> Handle(int userId, CancellationToken cancellationToken)
    {
        var unread = await db.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(cancellationToken);

        foreach (var notification in unread)
        {
            notification.IsRead = true;
        }

        await db.SaveChangesAsync(cancellationToken);

        return unread.Count;
    }
}

public class MarkAllAsReadEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/notifications/mark-all-read",
                async (ClaimsPrincipal caller, MarkAllAsReadHandler handler, CancellationToken ct) =>
                {
                    var count = await handler.Handle(caller.GetUserId(), ct);
                    return Results.Ok(new { updated = count });
                })
            .RequireAuthorization()
            .WithName("MarkAllAsRead")
            .WithTags("Notifications")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status401Unauthorized);
    }
}
