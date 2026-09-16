using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Users.UpdateUser;

public record UpdateUserRequest(
    string Name,
    string Email,
    string Phone,
    string City,
    int? Age,
    bool IsDonor,
    bool IsAdmin,
    BloodType? BloodType,
    DateOnly? LastDonationDate);

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

public class UpdateUserValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(320);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(30);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Age).InclusiveBetween(1, 120).When(x => x.Age is not null);
    }
}

public enum UpdateUserStatus
{
    Success,
    NotFound,
    EmailTaken
}

public record UpdateUserResult(UpdateUserStatus Status, UserResponse? Response = null)
{
    public static UpdateUserResult Success(UserResponse response) => new(UpdateUserStatus.Success, response);
    public static UpdateUserResult NotFound() => new(UpdateUserStatus.NotFound);
    public static UpdateUserResult EmailTaken() => new(UpdateUserStatus.EmailTaken);
}

public class UpdateUserHandler(AppDbContext db)
{
    public async Task<UpdateUserResult> Handle(int id, UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);
        if (user is null)
        {
            return UpdateUserResult.NotFound();
        }

        var emailTaken = await db.Users
            .AnyAsync(u => u.Id != id && u.Email == request.Email, cancellationToken);
        if (emailTaken)
        {
            return UpdateUserResult.EmailTaken();
        }

        user.Name = request.Name;
        user.Email = request.Email;
        user.Phone = request.Phone;
        user.City = request.City;
        user.Age = request.Age;
        user.IsDonor = request.IsDonor;
        user.IsAdmin = request.IsAdmin;
        user.BloodType = request.BloodType;
        user.LastDonationDate = request.LastDonationDate;

        await db.SaveChangesAsync(cancellationToken);

        var response = new UserResponse(user.Id, user.Name, user.Email, user.Phone, user.City, user.Age,
            user.IsDonor, user.IsAdmin, user.BloodType, user.LastDonationDate);
        return UpdateUserResult.Success(response);
    }
}

public class UpdateUserEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/users/update/{id:int}",
                async (int id, UpdateUserRequest request, UpdateUserValidator validator, UpdateUserHandler handler,
                    CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var result = await handler.Handle(id, request, ct);
                    return result.Status switch
                    {
                        UpdateUserStatus.Success => Results.Ok(result.Response),
                        UpdateUserStatus.NotFound => Results.NotFound(),
                        UpdateUserStatus.EmailTaken => Results.Conflict("Există deja un utilizator cu acest email."),
                        _ => Results.Problem()
                    };
                })
            .WithName("UpdateUser")
            .WithTags("Users")
            .Produces<UserResponse>()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status409Conflict)
            .ProducesValidationProblem();
    }
}
