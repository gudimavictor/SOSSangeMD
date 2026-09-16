using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Requests.CreateRequest;

public record CreateRequestRequest(
    int RequesterId,
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
    public CreateRequestValidator(AppDbContext db)
    {
        RuleFor(x => x.RequesterId)
            .MustAsync(async (id, cancellationToken) => await db.Users.AnyAsync(u => u.Id == id, cancellationToken))
            .WithMessage("Solicitantul nu există.");
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(1000);
    }
}

public class CreateRequestHandler(AppDbContext db)
{
    public async Task<BloodRequestResponse> Handle(CreateRequestRequest request, CancellationToken cancellationToken)
    {
        var entity = new BloodRequest
        {
            RequesterId = request.RequesterId,
            RequiredBloodType = request.RequiredBloodType,
            City = request.City,
            Urgency = request.Urgency,
            Description = request.Description,
            Status = RequestStatus.Active,
            CreatedAt = DateTime.UtcNow
        };

        db.BloodRequests.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        var requester = await db.Users.FirstAsync(u => u.Id == entity.RequesterId, cancellationToken);

        return new BloodRequestResponse(entity.Id, entity.RequesterId, requester.Name, entity.RequiredBloodType,
            entity.City, entity.Urgency, entity.Description, entity.Status, entity.CreatedAt);
    }
}

public class CreateRequestEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/requests/create",
                async (CreateRequestRequest request, CreateRequestValidator validator, CreateRequestHandler handler,
                    CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var response = await handler.Handle(request, ct);
                    return Results.Created($"/api/requests/get/{response.Id}", response);
                })
            .WithName("CreateRequest")
            .WithTags("Requests")
            .Produces<BloodRequestResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem();
    }
}
