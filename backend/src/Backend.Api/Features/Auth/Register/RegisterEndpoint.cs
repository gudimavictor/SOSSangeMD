using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Auth.Register;

public record RegisterRequest(
    string Name,
    string Email,
    string Password,
    string Phone,
    string City,
    int? Age,
    bool IsDonor,
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

public class RegisterValidator : AbstractValidator<RegisterRequest>
{
    public RegisterValidator(AppDbContext db)
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(320)
            .MustAsync(async (email, cancellationToken) =>
                !await db.Users.AnyAsync(u => u.Email == email, cancellationToken))
            .WithMessage("Există deja un utilizator cu acest email.");
        RuleFor(x => x.Password).NotEmpty().MinimumLength(8);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(30);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Age).InclusiveBetween(1, 120).When(x => x.Age is not null);
    }
}

public class RegisterHandler(AppDbContext db, IPasswordHasher<User> passwordHasher)
{
    public async Task<UserResponse> Handle(RegisterRequest request, CancellationToken cancellationToken)
    {
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone,
            City = request.City,
            Age = request.Age,
            IsDonor = request.IsDonor,
            IsAdmin = false,
            BloodType = request.BloodType,
            LastDonationDate = request.LastDonationDate
        };

        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        db.Users.Add(user);
        await db.SaveChangesAsync(cancellationToken);

        return new UserResponse(user.Id, user.Name, user.Email, user.Phone, user.City, user.Age,
            user.IsDonor, user.IsAdmin, user.BloodType, user.LastDonationDate);
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
