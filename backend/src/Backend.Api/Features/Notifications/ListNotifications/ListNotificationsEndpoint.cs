using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Notifications.ListNotifications;

public record NotificationResponse(
    int Id,
    int UserId,
    NotificationType Type,
    string Title,
    string Message,
    bool IsRead,
    DateTime CreatedAt,
    string? Link);

public class ListNotificationsHandler(AppDbContext db)
{
    public async Task<IReadOnlyList<NotificationResponse>> Handle(int userId, CancellationToken cancellationToken)
    {
        return await db.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationResponse(n.Id, n.UserId, n.Type, n.Title, n.Message, n.IsRead, n.CreatedAt,
                n.Link))
            .ToListAsync(cancellationToken);
    }
}

public class ListNotificationsEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/notifications/list/{userId:int}",
                async (int userId, ListNotificationsHandler handler, CancellationToken ct) =>
                {
                    var notifications = await handler.Handle(userId, ct);
                    return Results.Ok(notifications);
                })
            .WithName("ListNotifications")
            .WithTags("Notifications")
            .Produces<IReadOnlyList<NotificationResponse>>();
    }
}
