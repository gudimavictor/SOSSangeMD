using Backend.Api.Common.Endpoints;
using Backend.Api.Common.Validation;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Users.UpdateUser;

public record UpdateUserRequest(
    string Nume,
    string Email,
    string Telefon,
    string Oras,
    int? Varsta,
    bool EsteDonator,
    bool EsteAdmin,
    GrupaSanguina? GrupaSanguina,
    DateOnly? DataUltimeiDonari);

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

public class UpdateUserValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserValidator()
    {
        RuleFor(x => x.Nume).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(320);
        RuleFor(x => x.Telefon).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Oras).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Varsta).InclusiveBetween(1, 120).When(x => x.Varsta is not null);
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

        user.Nume = request.Nume;
        user.Email = request.Email;
        user.Telefon = request.Telefon;
        user.Oras = request.Oras;
        user.Varsta = request.Varsta;
        user.EsteDonator = request.EsteDonator;
        user.EsteAdmin = request.EsteAdmin;
        user.GrupaSanguina = request.GrupaSanguina;
        user.DataUltimeiDonari = request.DataUltimeiDonari;

        await db.SaveChangesAsync(cancellationToken);

        var response = new UserResponse(user.Id, user.Nume, user.Email, user.Telefon, user.Oras, user.Varsta,
            user.EsteDonator, user.EsteAdmin, user.GrupaSanguina, user.DataUltimeiDonari);
        return UpdateUserResult.Success(response);
    }
}

public class UpdateUserEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/users/update/{id:int}",
                async (int id, UpdateUserRequest request, UpdateUserHandler handler, CancellationToken ct) =>
                {
                    var result = await handler.Handle(id, request, ct);
                    return result.Status switch
                    {
                        UpdateUserStatus.Success => Results.Ok(result.Response),
                        UpdateUserStatus.NotFound => Results.NotFound(),
                        UpdateUserStatus.EmailTaken => Results.Conflict("Există deja un utilizator cu acest email."),
                        _ => Results.Problem()
                    };
                })
            .WithRequestValidation<UpdateUserRequest>()
            .WithName("UpdateUser")
            .WithTags("Users")
            .Produces<UserResponse>()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status409Conflict)
            .ProducesValidationProblem();
    }
}
