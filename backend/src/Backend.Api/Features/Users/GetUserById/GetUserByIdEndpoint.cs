using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Users.GetUserById;

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

public class GetUserByIdHandler(AppDbContext db)
{
    public async Task<UserResponse?> Handle(int id, CancellationToken cancellationToken)
    {
        return await db.Users
            .Where(u => u.Id == id)
            .Select(u => new UserResponse(u.Id, u.Name, u.Email, u.Phone, u.City, u.Age, u.IsDonor,
                u.IsAdmin, u.BloodType, u.LastDonationDate))
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
            .RequireAuthorization()
            .WithName("GetUserById")
            .WithTags("Users")
            .Produces<UserResponse>()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized);
    }
}
