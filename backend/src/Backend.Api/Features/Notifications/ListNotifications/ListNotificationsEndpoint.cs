using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Notifications.ListNotifications;

public record NotificationResponse(
    int Id,
    int UserId,
    TipNotificare Tip,
    string Titlu,
    string Mesaj,
    bool Citita,
    DateTime Data,
    string? Link);

public class ListNotificationsHandler(AppDbContext db)
{
    public async Task<IReadOnlyList<NotificationResponse>> Handle(int userId, CancellationToken cancellationToken)
    {
        return await db.Notificari
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.Data)
            .Select(n => new NotificationResponse(n.Id, n.UserId, n.Tip, n.Titlu, n.Mesaj, n.Citita, n.Data, n.Link))
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
