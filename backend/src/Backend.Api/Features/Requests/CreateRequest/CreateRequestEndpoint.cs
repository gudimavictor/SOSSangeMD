using System.Security.Claims;
using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Domain.Enums;
using Backend.Api.Domain.Services;
using Backend.Api.Infrastructure.Auth;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Requests.CreateRequest;

public record CreateRequestRequest(
    BloodType RequiredBloodType,
    string City,
    UrgencyLevel Urgency,
    string Description);

public record BloodRequestResponse(
    int Id,
    int RequesterId,
    string RequesterName,
    BloodType RequiredBloodType,
    string City,
    UrgencyLevel Urgency,
    string Description,
    RequestStatus Status,
    DateTime CreatedAt);

public class CreateRequestValidator : AbstractValidator<CreateRequestRequest>
{
    public CreateRequestValidator()
    {
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(1000);
    }
}

public class CreateRequestHandler(AppDbContext db)
{
    public async Task<BloodRequestResponse> Handle(CreateRequestRequest request, int requesterId,
        CancellationToken cancellationToken)
    {
        var entity = new BloodRequest
        {
            RequesterId = requesterId,
            RequiredBloodType = request.RequiredBloodType,
            City = request.City,
            Urgency = request.Urgency,
            Description = request.Description,
            Status = RequestStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        db.BloodRequests.Add(entity);

        var requester = await db.Users.FirstAsync(u => u.Id == entity.RequesterId, cancellationToken);

        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var compatibleDonors = await db.Users
            .Where(u => u.IsDonor && u.BloodType != null && u.City == entity.City && u.Id != entity.RequesterId)
            .ToListAsync(cancellationToken);

        foreach (var donor in compatibleDonors)
        {
            if (!BloodCompatibility.IsCompatible(donor.BloodType!.Value, entity.RequiredBloodType) ||
                !DonorEligibility.IsEligible(donor.LastDonationDate, today))
            {
                continue;
            }

            db.Notifications.Add(new Notification
            {
                UserId = donor.Id,
                Type = NotificationType.CompatibleRequest,
                Title = "O cerere nouă compatibilă cu tine",
                Message = $"Grupa {entity.RequiredBloodType} este necesară în {entity.City}.",
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                Link = "/cereri-compatibile"
            });
        }

        await db.SaveChangesAsync(cancellationToken);

        return new BloodRequestResponse(entity.Id, entity.RequesterId, requester.Name, entity.RequiredBloodType,
            entity.City, entity.Urgency, entity.Description, entity.Status, entity.CreatedAt);
    }
}

public class CreateRequestEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/requests/create",
                async (CreateRequestRequest request, ClaimsPrincipal caller, CreateRequestValidator validator,
                    CreateRequestHandler handler, CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var response = await handler.Handle(request, caller.GetUserId(), ct);
                    return Results.Created($"/api/requests/get/{response.Id}", response);
                })
            .RequireAuthorization()
            .WithName("CreateRequest")
            .WithTags("Requests")
            .Produces<BloodRequestResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized)
            .ProducesValidationProblem();
    }
}
