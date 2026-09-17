using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Infrastructure.Email;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;

namespace Backend.Api.Features.Auth.SendVerificationCode;

public record SendVerificationCodeRequest(string Email);

public class SendVerificationCodeValidator : AbstractValidator<SendVerificationCodeRequest>
{
    public SendVerificationCodeValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
    }
}

public class SendVerificationCodeHandler(AppDbContext db, EmailSender emailSender)
{
    public async Task Handle(SendVerificationCodeRequest request, CancellationToken cancellationToken)
    {
        var code = Random.Shared.Next(0, 1_000_000).ToString("D6");

        var entity = new EmailVerificationCode
        {
            Email = request.Email,
            Code = code,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10)
        };
        db.EmailVerificationCodes.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        await emailSender.SendAsync(request.Email, "Codul tău de confirmare SOSSange",
            $"Codul tău de confirmare este: {code}\n\nAcest cod expiră în 10 minute.", cancellationToken);
    }
}

public class SendVerificationCodeEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/send-verification-code",
                async (SendVerificationCodeRequest request, SendVerificationCodeValidator validator,
                    SendVerificationCodeHandler handler, CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    await handler.Handle(request, ct);
                    return Results.Ok();
                })
            .WithName("SendVerificationCode")
            .WithTags("Auth")
            .Produces(StatusCodes.Status200OK)
            .ProducesValidationProblem();
    }
}
