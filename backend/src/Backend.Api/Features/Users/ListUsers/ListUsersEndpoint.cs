using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Users.ListUsers;

public record UserResponse(
    int Id,
    string Name,
    string Email,
    string Phone,
    string City,
    int? Age,
    bool IsDonor,
    bool IsAdmin,
    BloodType? BloodType,
    DateOnly? LastDonationDate);

public class ListUsersHandler(AppDbContext db)
{
    public async Task<IReadOnlyList<UserResponse>> Handle(CancellationToken cancellationToken)
    {
        return await db.Users
            .OrderBy(u => u.Name)
            .Select(u => new UserResponse(u.Id, u.Name, u.Email, u.Phone, u.City, u.Age, u.IsDonor,
                u.IsAdmin, u.BloodType, u.LastDonationDate))
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
            .RequireAuthorization("AdminOnly")
            .WithName("ListUsers")
            .WithTags("Users")
            .Produces<IReadOnlyList<UserResponse>>()
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden);
    }
}
