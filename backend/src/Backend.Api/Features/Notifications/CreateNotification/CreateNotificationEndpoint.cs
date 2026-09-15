using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Notifications.CreateNotification;

public record CreateNotificationRequest(
    int UserId,
    TipNotificare Tip,
    string Titlu,
    string Mesaj,
    string? Link);

public record NotificationResponse(
    int Id,
    int UserId,
    TipNotificare Tip,
    string Titlu,
    string Mesaj,
    bool Citita,
    DateTime Data,
    string? Link);

public class CreateNotificationValidator : AbstractValidator<CreateNotificationRequest>
{
    public CreateNotificationValidator(AppDbContext db)
    {
        RuleFor(x => x.UserId)
            .MustAsync(async (id, cancellationToken) => await db.Users.AnyAsync(u => u.Id == id, cancellationToken))
            .WithMessage("Utilizatorul nu există.");
        RuleFor(x => x.Titlu).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Mesaj).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.Link).MaximumLength(200);
    }
}

public class CreateNotificationHandler(AppDbContext db)
{
    public async Task<NotificationResponse> Handle(CreateNotificationRequest request,
        CancellationToken cancellationToken)
    {
        var entity = new Notificare
        {
            UserId = request.UserId,
            Tip = request.Tip,
            Titlu = request.Titlu,
            Mesaj = request.Mesaj,
            Citita = false,
            Data = DateTime.UtcNow,
            Link = request.Link
        };

        db.Notificari.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        return new NotificationResponse(entity.Id, entity.UserId, entity.Tip, entity.Titlu, entity.Mesaj,
            entity.Citita, entity.Data, entity.Link);
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
                    return Results.Created($"/api/notifications/list/{response.UserId}", response);
                })
            .WithName("CreateNotification")
            .WithTags("Notifications")
            .Produces<NotificationResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem();
    }
}
