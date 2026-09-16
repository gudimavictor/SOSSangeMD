using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Users.DeleteUser;

public class DeleteUserHandler(AppDbContext db)
{
    public async Task<bool> Handle(int id, CancellationToken cancellationToken)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user is null)
        {
            return false;
        }

        db.Users.Remove(user);
        await db.SaveChangesAsync(cancellationToken);

        return true;
    }
}

public class DeleteUserEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/users/delete/{id:int}", async (int id, DeleteUserHandler handler, CancellationToken ct) =>
            {
                var deleted = await handler.Handle(id, ct);
                return deleted ? Results.NoContent() : Results.NotFound();
            })
            .RequireAuthorization("AdminOnly")
            .WithName("DeleteUser")
            .WithTags("Users")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
    }
}
