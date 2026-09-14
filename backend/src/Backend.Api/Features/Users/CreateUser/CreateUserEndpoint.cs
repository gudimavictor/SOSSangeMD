using Backend.Api.Common.Endpoints;
using Backend.Api.Common.Validation;
using Backend.Api.Domain.Entities;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Users.CreateUser;

public record CreateUserRequest(
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

public class CreateUserValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserValidator(AppDbContext db)
    {
        RuleFor(x => x.Nume).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(320)
            .MustAsync(async (email, cancellationToken) =>
                !await db.Users.AnyAsync(u => u.Email == email, cancellationToken))
            .WithMessage("Există deja un utilizator cu acest email.");
        RuleFor(x => x.Telefon).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Oras).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Varsta).InclusiveBetween(1, 120).When(x => x.Varsta is not null);
    }
}

public class CreateUserHandler(AppDbContext db)
{
    public async Task<UserResponse> Handle(CreateUserRequest request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            Nume = request.Nume,
            Email = request.Email,
            Telefon = request.Telefon,
            Oras = request.Oras,
            Varsta = request.Varsta,
            EsteDonator = request.EsteDonator,
            EsteAdmin = request.EsteAdmin,
            GrupaSanguina = request.GrupaSanguina,
            DataUltimeiDonari = request.DataUltimeiDonari
        };

        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);

        return new UserResponse(user.Id, user.Nume, user.Email, user.Telefon, user.Oras, user.Varsta,
            user.EsteDonator, user.EsteAdmin, user.GrupaSanguina, user.DataUltimeiDonari);
    }
}

public class CreateUserEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/users/create",
                async (CreateUserRequest request, CreateUserHandler handler, CancellationToken ct) =>
                {
                    var response = await handler.Handle(request, ct);
                    return Results.Created($"/api/users/get/{response.Id}", response);
                })
            .WithRequestValidation<CreateUserRequest>()
            .WithName("CreateUser")
            .WithTags("Users")
            .Produces<UserResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem();
    }
}
