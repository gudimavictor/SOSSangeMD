using System.Security.Claims;
using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Infrastructure.Auth;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Support.CreateSupportMessage;

public record CreateSupportMessageRequest(string Message);

public record SupportMessageResponse(
    int Id,
    int UserId,
    string UserName,
    string UserEmail,
    string Message,
    DateTime CreatedAt,
    string? Reply,
    DateTime? RepliedAt);

public class CreateSupportMessageValidator : AbstractValidator<CreateSupportMessageRequest>
{
    public CreateSupportMessageValidator()
    {
        RuleFor(x => x.Message).NotEmpty().MaximumLength(1000);
    }
}

public class CreateSupportMessageHandler(AppDbContext db)
{
    public async Task<SupportMessageResponse> Handle(CreateSupportMessageRequest request, int userId,
        CancellationToken cancellationToken)
    {
        var entity = new SupportMessage
        {
            UserId = userId,
            Message = request.Message,
            CreatedAt = DateTime.UtcNow
        };

        db.SupportMessages.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        var user = await db.Users.FirstAsync(u => u.Id == userId, cancellationToken);

        return new SupportMessageResponse(entity.Id, entity.UserId, user.Name, user.Email, entity.Message,
            entity.CreatedAt, entity.Reply, entity.RepliedAt);
    }
}

public class CreateSupportMessageEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/support/create",
                async (CreateSupportMessageRequest request, ClaimsPrincipal caller,
                    CreateSupportMessageValidator validator, CreateSupportMessageHandler handler,
                    CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var response = await handler.Handle(request, caller.GetUserId(), ct);
                    return Results.Created($"/api/support/get/{response.Id}", response);
                })
            .RequireAuthorization()
            .WithName("CreateSupportMessage")
            .WithTags("Support")
            .Produces<SupportMessageResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesValidationProblem();
    }
}
