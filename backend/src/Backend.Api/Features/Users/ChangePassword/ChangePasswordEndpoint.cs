using System.Security.Claims;
using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Infrastructure.Auth;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Users.ChangePassword;

public record ChangePasswordRequest(string CurrentPassword, string NewPassword);

public class ChangePasswordValidator : AbstractValidator<ChangePasswordRequest>
{
    public ChangePasswordValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(8);
    }
}

public enum ChangePasswordStatus
{
    Success,
    NotFound,
    WrongPassword
}

public class ChangePasswordHandler(AppDbContext db, IPasswordHasher<User> passwordHasher,
    ILogger<ChangePasswordHandler> logger)
{
    public async Task<ChangePasswordStatus> Handle(int userId, ChangePasswordRequest request,
        CancellationToken cancellationToken)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
        {
            return ChangePasswordStatus.NotFound;
        }

        var verification = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
        if (verification == PasswordVerificationResult.Failed)
        {
            logger.LogWarning("Password change failed: incorrect current password for user {UserId}", userId);
            return ChangePasswordStatus.WrongPassword;
        }

        user.PasswordHash = passwordHasher.HashPassword(user, request.NewPassword);
        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("User {UserId} changed their password", userId);
        return ChangePasswordStatus.Success;
    }
}

public class ChangePasswordEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/users/change-password",
                async (ChangePasswordRequest request, ClaimsPrincipal caller, ChangePasswordValidator validator,
                    ChangePasswordHandler handler, CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var status = await handler.Handle(caller.GetUserId(), request, ct);
                    return status switch
                    {
                        ChangePasswordStatus.Success => Results.NoContent(),
                        ChangePasswordStatus.NotFound => Results.NotFound(),
                        ChangePasswordStatus.WrongPassword => Results.BadRequest("Parola curentă este incorectă."),
                        _ => Results.Problem()
                    };
                })
            .RequireAuthorization()
            .WithName("ChangePassword")
            .WithTags("Users")
            .Produces(StatusCodes.Status204NoContent)
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesValidationProblem();
    }
}
