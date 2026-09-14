using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Users.ListUsers;

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

public class ListUsersHandler(AppDbContext db)
{
    public async Task<IReadOnlyList<UserResponse>> Handle(CancellationToken cancellationToken)
    {
        return await db.Users
            .OrderBy(u => u.Nume)
            .Select(u => new UserResponse(u.Id, u.Nume, u.Email, u.Telefon, u.Oras, u.Varsta, u.EsteDonator,
                u.EsteAdmin, u.GrupaSanguina, u.DataUltimeiDonari))
            .ToListAsync(cancellationToken);
    }
}

public class ListUsersEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/users/list", async (ListUsersHandler handler, CancellationToken ct) =>
            {
                var users = await handler.Handle(ct);
                return Results.Ok(users);
            })
            .WithName("ListUsers")
            .WithTags("Users")
            .Produces<IReadOnlyList<UserResponse>>();
    }
}
