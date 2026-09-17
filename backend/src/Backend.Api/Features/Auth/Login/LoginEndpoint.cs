using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Auth;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Backend.Api.Features.Auth.Login;

public record LoginRequest(string Email, string Password);

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

public record LoginResponse(
    string Token,
    DateTime ExpiresAt,
    string RefreshToken,
    DateTime RefreshTokenExpiresAt,
    UserResponse User);

public class LoginValidator : AbstractValidator<LoginRequest>
{
    public LoginValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public enum LoginStatus
{
    Success,
    InvalidCredentials
}

public record LoginResult(LoginStatus Status, LoginResponse? Response = null)
{
    public static LoginResult Success(LoginResponse response) => new(LoginStatus.Success, response);
    public static LoginResult InvalidCredentials() => new(LoginStatus.InvalidCredentials);
}

public class LoginHandler(
    AppDbContext db,
    IPasswordHasher<User> passwordHasher,
    JwtTokenGenerator tokenGenerator,
    RefreshTokenGenerator refreshTokenGenerator,
    IOptions<JwtSettings> jwtSettings,
    ILogger<LoginHandler> logger)
{
    public async Task<LoginResult> Handle(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (user is null)
        {
            logger.LogWarning("Login failed: no account exists with email {Email}", request.Email);
            return LoginResult.InvalidCredentials();
        }

        var verification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verification == PasswordVerificationResult.Failed)
        {
            logger.LogWarning("Login failed: incorrect password for user {UserId}", user.Id);
            return LoginResult.InvalidCredentials();
        }

        var token = tokenGenerator.GenerateToken(user);

        var refreshToken = new RefreshToken
        {
            Token = refreshTokenGenerator.Generate(),
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(jwtSettings.Value.RefreshTokenExpiryDays)
        };
        db.RefreshTokens.Add(refreshToken);
        await db.SaveChangesAsync(cancellationToken);

        var userResponse = new UserResponse(user.Id, user.Name, user.Email, user.Phone, user.City, user.Age,
            user.IsDonor, user.IsAdmin, user.BloodType, user.LastDonationDate);

        logger.LogInformation("User {UserId} logged in successfully", user.Id);

        return LoginResult.Success(new LoginResponse(token.Value, token.ExpiresAt, refreshToken.Token,
            refreshToken.ExpiresAt, userResponse));
    }
}

public class LoginEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/login",
                async (LoginRequest request, LoginValidator validator, LoginHandler handler, CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var result = await handler.Handle(request, ct);
                    return result.Status switch
                    {
                        LoginStatus.Success => Results.Ok(result.Response),
                        LoginStatus.InvalidCredentials => Results.Unauthorized(),
                        _ => Results.Problem()
                    };
                })
            .WithName("Login")
            .WithTags("Auth")
            .Produces<LoginResponse>()
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesValidationProblem();
    }
}
