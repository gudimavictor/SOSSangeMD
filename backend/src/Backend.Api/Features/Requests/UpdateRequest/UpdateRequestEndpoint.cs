using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Requests.UpdateRequest;

public record UpdateRequestRequest(
    BloodType RequiredBloodType,
    string City,
    UrgencyLevel Urgency,
    string Description,
    RequestStatus Status);

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

public class UpdateRequestValidator : AbstractValidator<UpdateRequestRequest>
{
    public UpdateRequestValidator()
    {
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Description).NotEmpty().MaximumLength(1000);
    }
}

public class UpdateRequestHandler(AppDbContext db)
{
    public async Task<BloodRequestResponse?> Handle(int id, UpdateRequestRequest request,
        CancellationToken cancellationToken)
    {
        var entity = await db.BloodRequests
            .Include(r => r.Requester)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        entity.RequiredBloodType = request.RequiredBloodType;
        entity.City = request.City;
        entity.Urgency = request.Urgency;
        entity.Description = request.Description;
        entity.Status = request.Status;

        await db.SaveChangesAsync(cancellationToken);

        return new BloodRequestResponse(entity.Id, entity.RequesterId, entity.Requester.Name,
            entity.RequiredBloodType, entity.City, entity.Urgency, entity.Description, entity.Status,
            entity.CreatedAt);
    }
}

public class UpdateRequestEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/requests/update/{id:int}",
                async (int id, UpdateRequestRequest request, UpdateRequestValidator validator,
                    UpdateRequestHandler handler, CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var response = await handler.Handle(id, request, ct);
                    return response is not null ? Results.Ok(response) : Results.NotFound();
                })
            .WithName("UpdateRequest")
            .WithTags("Requests")
            .Produces<BloodRequestResponse>()
            .Produces(StatusCodes.Status404NotFound)
            .ProducesValidationProblem();
    }
}
