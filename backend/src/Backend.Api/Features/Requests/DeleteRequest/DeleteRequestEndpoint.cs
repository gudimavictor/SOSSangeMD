using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Requests.DeleteRequest;

public class DeleteRequestHandler(AppDbContext db)
{
    public async Task<bool> Handle(int id, CancellationToken cancellationToken)
    {
        var entity = await db.BloodRequests.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        if (entity is null)
        {
            return false;
        }

        db.BloodRequests.Remove(entity);
        await db.SaveChangesAsync(cancellationToken);

        return true;
    }
}

public class DeleteRequestEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/requests/delete/{id:int}",
                async (int id, DeleteRequestHandler handler, CancellationToken ct) =>
                {
                    var deleted = await handler.Handle(id, ct);
                    return deleted ? Results.NoContent() : Results.NotFound();
                })
            .WithName("DeleteRequest")
            .WithTags("Requests")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);
    }
}
