using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Centers.DeleteCenter;

public class DeleteCenterHandler(AppDbContext db)
{
    public async Task<bool> Handle(int id, CancellationToken cancellationToken)
    {
        var center = await db.TransfusionCenters.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (center is null)
        {
            return false;
        }

        db.TransfusionCenters.Remove(center);
        await db.SaveChangesAsync(cancellationToken);

        return true;
    }
}

public class DeleteCenterEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/centers/delete/{id:int}",
                async (int id, DeleteCenterHandler handler, CancellationToken ct) =>
                {
                    var deleted = await handler.Handle(id, ct);
                    return deleted ? Results.NoContent() : Results.NotFound();
                })
            .WithName("DeleteCenter")
            .WithTags("Centers")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound);
    }
}
