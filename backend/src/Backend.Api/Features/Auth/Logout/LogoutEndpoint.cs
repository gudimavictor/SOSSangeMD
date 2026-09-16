using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Auth.Logout;

public record LogoutRequest(string RefreshToken);

public class LogoutValidator : AbstractValidator<LogoutRequest>
{
    public LogoutValidator()
    {
        RuleFor(x => x.RefreshToken).NotEmpty();
    }
}

public enum LogoutStatus
{
    Success,
    InvalidToken
}

public record LogoutResult(LogoutStatus Status)
{
    public static LogoutResult Success() => new(LogoutStatus.Success);
    public static LogoutResult InvalidToken() => new(LogoutStatus.InvalidToken);
}

public class LogoutHandler(AppDbContext db)
{
    public async Task<LogoutResult> Handle(LogoutRequest request, CancellationToken cancellationToken)
    {
        var existingToken = await db.RefreshTokens
            .FirstOrDefaultAsync(t => t.Token == request.RefreshToken, cancellationToken);

        if (existingToken is null || !existingToken.IsActive)
        {
            return LogoutResult.InvalidToken();
        }

        existingToken.RevokedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return LogoutResult.Success();
    }
}

public class LogoutEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/logout",
                async (LogoutRequest request, LogoutValidator validator, LogoutHandler handler, CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var result = await handler.Handle(request, ct);
                    return result.Status switch
                    {
                        LogoutStatus.Success => Results.NoContent(),
                        LogoutStatus.InvalidToken => Results.Unauthorized(),
                        _ => Results.Problem()
                    };
                })
            .WithName("Logout")
            .WithTags("Auth")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesValidationProblem();
    }
}
