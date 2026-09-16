using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Notifications.MarkAllAsRead;

public class MarkAllAsReadHandler(AppDbContext db)
{
    public async Task<int> Handle(int userId, CancellationToken cancellationToken)
    {
        var unread = await db.Notificari
            .Where(n => n.UserId == userId && !n.Citita)
            .ToListAsync(cancellationToken);

        foreach (var notificare in unread)
        {
            notificare.Citita = true;
        }

        await db.SaveChangesAsync(cancellationToken);

        return unread.Count;
    }
}

public class MarkAllAsReadEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/notifications/mark-all-read/{userId:int}",
                async (int userId, MarkAllAsReadHandler handler, CancellationToken ct) =>
                {
                    var count = await handler.Handle(userId, ct);
                    return Results.Ok(new { updated = count });
                })
            .WithName("MarkAllAsRead")
            .WithTags("Notifications")
            .Produces(StatusCodes.Status200OK);
    }
}
