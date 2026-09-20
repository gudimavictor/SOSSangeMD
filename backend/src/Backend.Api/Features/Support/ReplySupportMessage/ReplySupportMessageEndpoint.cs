using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Support.ReplySupportMessage;

public record ReplySupportMessageRequest(string Reply);

public record SupportMessageResponse(
    int Id,
    int UserId,
    string UserName,
    string UserEmail,
    string Message,
    DateTime CreatedAt,
    string? Reply,
    DateTime? RepliedAt);

public class ReplySupportMessageValidator : AbstractValidator<ReplySupportMessageRequest>
{
    public ReplySupportMessageValidator()
    {
        RuleFor(x => x.Reply).NotEmpty().MaximumLength(1000);
    }
}

public class ReplySupportMessageHandler(AppDbContext db)
{
    public async Task<SupportMessageResponse?> Handle(int id, ReplySupportMessageRequest request,
        CancellationToken cancellationToken)
    {
        var entity = await db.SupportMessages
            .Include(m => m.User)
            .FirstOrDefaultAsync(m => m.Id == id, cancellationToken);

        if (entity is null)
        {
            return null;
        }

        entity.Reply = request.Reply;
        entity.RepliedAt = DateTime.UtcNow;

        db.Notifications.Add(new Notification
        {
            UserId = entity.UserId,
            Type = NotificationType.SupportReply,
            Title = "Ai primit un răspuns de la echipa de suport",
            Message = request.Reply,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            Link = "/suport"
        });

        await db.SaveChangesAsync(cancellationToken);

        return new SupportMessageResponse(entity.Id, entity.UserId, entity.User.Name, entity.User.Email,
            entity.Message, entity.CreatedAt, entity.Reply, entity.RepliedAt);
    }
}

public class ReplySupportMessageEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/support/reply/{id:int}",
                async (int id, ReplySupportMessageRequest request, ReplySupportMessageValidator validator,
                    ReplySupportMessageHandler handler, CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var response = await handler.Handle(id, request, ct);
                    return response is not null ? Results.Ok(response) : Results.NotFound();
                })
            .RequireAuthorization("AdminOnly")
            .WithName("ReplySupportMessage")
            .WithTags("Support")
            .Produces<SupportMessageResponse>()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .ProducesValidationProblem();
    }
}
