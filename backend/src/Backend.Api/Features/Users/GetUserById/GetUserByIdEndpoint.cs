using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Users.GetUserById;

public record UserResponse(
    int Id,
    string Nume,
    string Email,
    string Telefon,
    string Oras,
    int? Varsta,
    bool EsteDonator,
    bool EsteAdmin,
    GrupaSanguina? GrupaSanguina,
    DateOnly? DataUltimeiDonari);

public class GetUserByIdHandler(AppDbContext db)
{
    public async Task<UserResponse?> Handle(int id, CancellationToken cancellationToken)
    {
        return await db.Users
            .Where(u => u.Id == id)
            .Select(u => new UserResponse(u.Id, u.Nume, u.Email, u.Telefon, u.Oras, u.Varsta, u.EsteDonator,
                u.EsteAdmin, u.GrupaSanguina, u.DataUltimeiDonari))
            .FirstOrDefaultAsync(cancellationToken);
    }
}

public class GetUserByIdEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/users/get/{id:int}", async (int id, GetUserByIdHandler handler, CancellationToken ct) =>
            {
                var user = await handler.Handle(id, ct);
                return user is not null ? Results.Ok(user) : Results.NotFound();
            })
            .WithName("GetUserById")
            .WithTags("Users")
            .Produces<UserResponse>()
            .Produces(StatusCodes.Status404NotFound);
    }
}
