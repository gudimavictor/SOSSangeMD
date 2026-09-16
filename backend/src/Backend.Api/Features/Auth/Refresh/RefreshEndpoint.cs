using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Infrastructure.Auth;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Backend.Api.Features.Auth.Refresh;

public record RefreshRequest(string RefreshToken);

public record RefreshResponse(string Token, DateTime ExpiresAt, string RefreshToken, DateTime RefreshTokenExpiresAt);

public class RefreshValidator : AbstractValidator<RefreshRequest>
{
    public RefreshValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public enum RefreshStatus
{
    Success,
    InvalidToken
}

public record RefreshResult(RefreshStatus Status, RefreshResponse? Response = null)
{
    public static RefreshResult Success(RefreshResponse response) => new(RefreshStatus.Success, response);
    public static RefreshResult InvalidToken() => new(RefreshStatus.InvalidToken);
}

public class RefreshHandler(
    AppDbContext db,
    JwtTokenGenerator tokenGenerator,
    RefreshTokenGenerator refreshTokenGenerator,
    IOptions<JwtSettings> jwtSettings)
{
    public async Task<RefreshResult> Handle(RefreshRequest request, CancellationToken cancellationToken)
    {
        var existingToken = await db.RefreshTokens
            .Include(t => t.User)
            .FirstOrDefaultAsync(t => t.Token == request.RefreshToken, cancellationToken);

        if (existingToken is null || !existingToken.IsActive)
        {
            return RefreshResult.InvalidToken();
        }

        existingToken.RevokedAt = DateTime.UtcNow;

        var newRefreshToken = new RefreshToken
        {
            Token = refreshTokenGenerator.Generate(),
            UserId = existingToken.UserId,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(jwtSettings.Value.RefreshTokenExpiryDays)
        };
        db.RefreshTokens.Add(newRefreshToken);

        var accessToken = tokenGenerator.GenerateToken(existingToken.User);

        await db.SaveChangesAsync(cancellationToken);

        var response = new RefreshResponse(accessToken.Value, accessToken.ExpiresAt, newRefreshToken.Token,
            newRefreshToken.ExpiresAt);
        return RefreshResult.Success(response);
    }
}

public class RefreshEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/refresh",
                async (RefreshRequest request, RefreshValidator validator, RefreshHandler handler,
                    CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var result = await handler.Handle(request, ct);
                    return result.Status switch
                    {
                        RefreshStatus.Success => Results.Ok(result.Response),
                        RefreshStatus.InvalidToken => Results.Unauthorized(),
                        _ => Results.Problem()
                    };
                })
            .WithName("Refresh")
            .WithTags("Auth")
            .Produces<RefreshResponse>()
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesValidationProblem();
    }
}
