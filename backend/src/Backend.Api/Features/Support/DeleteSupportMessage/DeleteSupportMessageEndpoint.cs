using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Support.DeleteSupportMessage;

public class DeleteSupportMessageHandler(AppDbContext db)
{
    public async Task<bool> Handle(int id, CancellationToken cancellationToken)
    {
        var entity = await db.SupportMessages.FirstOrDefaultAsync(m => m.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        db.SupportMessages.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);
        return true;
    }
}

public class DeleteSupportMessageEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/support/delete/{id:int}",
                async (int id, DeleteSupportMessageHandler handler, CancellationToken ct) =>
                {
                    var deleted = await handler.Handle(id, ct);
                    return deleted ? Results.NoContent() : Results.NotFound();
                })
            .RequireAuthorization("AdminOnly")
            .WithName("DeleteSupportMessage")
            .WithTags("Support")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
    }
}
