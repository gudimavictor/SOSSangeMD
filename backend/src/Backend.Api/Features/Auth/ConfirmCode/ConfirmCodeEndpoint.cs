using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Auth.ConfirmCode;

public record ConfirmCodeRequest(string Email, string Code);

public class ConfirmCodeValidator : AbstractValidator<ConfirmCodeRequest>
{
    public ConfirmCodeValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Code).NotEmpty().Length(6);
    }
}

public enum ConfirmCodeStatus
{
    Success,
    InvalidCode
}

public record ConfirmCodeResult(ConfirmCodeStatus Status)
{
    public static ConfirmCodeResult Success() => new(ConfirmCodeStatus.Success);
    public static ConfirmCodeResult InvalidCode() => new(ConfirmCodeStatus.InvalidCode);
}

public class ConfirmCodeHandler(AppDbContext db)
{
    public async Task<ConfirmCodeResult> Handle(ConfirmCodeRequest request, CancellationToken cancellationToken)
    {
        var entity = await db.EmailVerificationCodes
            .Where(c => c.Email == request.Email && c.Code == request.Code)
            .OrderByDescending(c => c.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

        if (entity is null || !entity.IsActive)
        {
            return ConfirmCodeResult.InvalidCode();
        }

        entity.ConfirmedAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        return ConfirmCodeResult.Success();
    }
}

public class ConfirmCodeEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/confirm-code",
                async (ConfirmCodeRequest request, ConfirmCodeValidator validator, ConfirmCodeHandler handler,
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
                        ConfirmCodeStatus.Success => Results.Ok(),
                        ConfirmCodeStatus.InvalidCode => Results.BadRequest("Cod invalid sau expirat."),
                        _ => Results.Problem()
                    };
                })
            .WithName("ConfirmCode")
            .WithTags("Auth")
            .Produces(StatusCodes.Status200OK)
            .Produces(StatusCodes.Status400BadRequest)
            .ProducesValidationProblem();
    }
}
