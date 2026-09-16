using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Notifications.CreateNotification;

public record CreateNotificationRequest(
    int UserId,
    NotificationType Type,
    string Title,
    string Message,
    string? Link);

public record NotificationResponse(
    int Id,
    int UserId,
    NotificationType Type,
    string Title,
    string Message,
    bool IsRead,
    DateTime CreatedAt,
    string? Link);

public class CreateNotificationValidator : AbstractValidator<CreateNotificationRequest>
{
    public CreateNotificationValidator(AppDbContext db)
    {
        RuleFor(x => x.UserId)
            .MustAsync(async (id, cancellationToken) => await db.Users.AnyAsync(u => u.Id == id, cancellationToken))
            .WithMessage("Utilizatorul nu există.");
        RuleFor(x => x.Title).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.Link).MaximumLength(200);
    }
}

public class CreateNotificationHandler(AppDbContext db)
{
    public async Task<NotificationResponse> Handle(CreateNotificationRequest request,
        CancellationToken cancellationToken)
    {
        var entity = new Notification
        {
            UserId = request.UserId,
            Type = request.Type,
            Title = request.Title,
            Message = request.Message,
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            Link = request.Link
        };

        db.Notifications.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        return new NotificationResponse(entity.Id, entity.UserId, entity.Type, entity.Title, entity.Message,
            entity.IsRead, entity.CreatedAt, entity.Link);
    }
}

public class CreateNotificationEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/notifications/create",
                async (CreateNotificationRequest request, CreateNotificationValidator validator,
                    CreateNotificationHandler handler, CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var response = await handler.Handle(request, ct);
                    return Results.Created("/api/notifications/mine", response);
                })
            .RequireAuthorization("AdminOnly")
            .WithName("CreateNotification")
            .WithTags("Notifications")
            .Produces<NotificationResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .ProducesValidationProblem();
    }
}
