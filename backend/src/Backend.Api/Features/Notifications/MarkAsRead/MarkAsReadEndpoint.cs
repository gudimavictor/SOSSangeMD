using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Notifications.MarkAsRead;

public record NotificationResponse(
    int Id,
    int UserId,
    TipNotificare Tip,
    string Titlu,
    string Mesaj,
    bool Citita,
    DateTime Data,
    string? Link);

public class MarkAsReadHandler(AppDbContext db)
{
    public async Task<NotificationResponse?> Handle(int id, CancellationToken cancellationToken)
    {
        var entity = await db.Notificari.FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        entity.Citita = true;
        await db.SaveChangesAsync(cancellationToken);

        return new NotificationResponse(entity.Id, entity.UserId, entity.Tip, entity.Titlu, entity.Mesaj,
            entity.Citita, entity.Data, entity.Link);
    }
}

public class MarkAsReadEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/notifications/mark-read/{id:int}",
                async (int id, MarkAsReadHandler handler, CancellationToken ct) =>
                {
                    var response = await handler.Handle(id, ct);
                    return response is not null ? Results.Ok(response) : Results.NotFound();
                })
            .WithName("MarkAsRead")
            .WithTags("Notifications")
            .Produces<NotificationResponse>()
            .Produces(StatusCodes.Status404NotFound);
    }
}
