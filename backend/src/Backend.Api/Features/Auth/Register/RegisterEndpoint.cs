using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Auth.Register;

public record RegisterRequest(
    string Nume,
    string Email,
    string Parola,
    string Telefon,
    string Oras,
    int? Varsta,
    bool EsteDonator,
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

public class RegisterValidator : AbstractValidator<RegisterRequest>
{
    public RegisterValidator(AppDbContext db)
    {
        RuleFor(x => x.Nume).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(320)
            .MustAsync(async (email, cancellationToken) =>
                !await db.Users.AnyAsync(u => u.Email == email, cancellationToken))
            .WithMessage("Există deja un utilizator cu acest email.");
        RuleFor(x => x.Parola).NotEmpty().MinimumLength(8);
        RuleFor(x => x.Telefon).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Oras).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Varsta).InclusiveBetween(1, 120).When(x => x.Varsta is not null);
    }
}

public class RegisterHandler(AppDbContext db, IPasswordHasher<User> passwordHasher)
{
    public async Task<UserResponse> Handle(RegisterRequest request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            Nume = request.Nume,
            Email = request.Email,
            Telefon = request.Telefon,
            Oras = request.Oras,
            Varsta = request.Varsta,
            EsteDonator = request.EsteDonator,
            EsteAdmin = false,
            GrupaSanguina = request.GrupaSanguina,
            DataUltimeiDonari = request.DataUltimeiDonari
        };

        user.ParolaHash = passwordHasher.HashPassword(user, request.Parola);

        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);

        return new UserResponse(user.Id, user.Nume, user.Email, user.Telefon, user.Oras, user.Varsta,
            user.EsteDonator, user.EsteAdmin, user.GrupaSanguina, user.DataUltimeiDonari);
    }
}

public class RegisterEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/register",
                async (RegisterRequest request, RegisterValidator validator, RegisterHandler handler,
                    CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var response = await handler.Handle(request, ct);
                    return Results.Created($"/api/users/get/{response.Id}", response);
                })
            .WithName("Register")
            .WithTags("Auth")
            .Produces<UserResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem();
    }
}
