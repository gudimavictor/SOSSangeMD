using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Support.ListSupportMessages;

public record SupportMessageResponse(
    int Id,
    int UserId,
    string UserName,
    string UserEmail,
    string Message,
    DateTime CreatedAt,
    string? Reply,
    DateTime? RepliedAt);

public class ListSupportMessagesHandler(AppDbContext db)
{
    public async Task<IReadOnlyList<SupportMessageResponse>> Handle(CancellationToken cancellationToken)
    {
        return await db.SupportMessages
            .OrderByDescending(m => m.CreatedAt)
            .Select(m => new SupportMessageResponse(m.Id, m.UserId, m.User.Name, m.User.Email, m.Message,
                m.CreatedAt, m.Reply, m.RepliedAt))
            .ToListAsync(cancellationToken);
    }
}

public class ListSupportMessagesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/support/list", async (ListSupportMessagesHandler handler, CancellationToken ct) =>
            {
                var messages = await handler.Handle(ct);
                return Results.Ok(messages);
            })
            .RequireAuthorization("AdminOnly")
            .WithName("ListSupportMessages")
            .WithTags("Support")
            .Produces<IReadOnlyList<SupportMessageResponse>>()
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
    }
}
