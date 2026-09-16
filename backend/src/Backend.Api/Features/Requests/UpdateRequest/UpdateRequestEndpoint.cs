using System.Security.Claims;
using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Auth;
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

public enum UpdateRequestStatus
{
    Success,
    NotFound,
    Forbidden
}

public record UpdateRequestResult(UpdateRequestStatus Status, BloodRequestResponse? Response = null)
{
    public static UpdateRequestResult Success(BloodRequestResponse response) => new(UpdateRequestStatus.Success, response);
    public static UpdateRequestResult NotFound() => new(UpdateRequestStatus.NotFound);
    public static UpdateRequestResult Forbidden() => new(UpdateRequestStatus.Forbidden);
}

public class UpdateRequestHandler(AppDbContext db)
{
    public async Task<UpdateRequestResult> Handle(int id, UpdateRequestRequest request, int callerId,
        bool callerIsAdmin, CancellationToken cancellationToken)
    {
        var entity = await db.BloodRequests
            .Include(r => r.Requester)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        if (entity is null)
        {
            return UpdateRequestResult.NotFound();
        }

        if (entity.RequesterId != callerId && !callerIsAdmin)
        {
            return UpdateRequestResult.Forbidden();
        }

        entity.RequiredBloodType = request.RequiredBloodType;
        entity.City = request.City;
        entity.Urgency = request.Urgency;
        entity.Description = request.Description;
        entity.Status = request.Status;

        await db.SaveChangesAsync(cancellationToken);

        var response = new BloodRequestResponse(entity.Id, entity.RequesterId, entity.Requester.Name,
            entity.RequiredBloodType, entity.City, entity.Urgency, entity.Description, entity.Status,
            entity.CreatedAt);
        return UpdateRequestResult.Success(response);
    }
}

public class UpdateRequestEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/requests/update/{id:int}",
                async (int id, UpdateRequestRequest request, ClaimsPrincipal caller,
                    UpdateRequestValidator validator, UpdateRequestHandler handler, CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var result = await handler.Handle(id, request, caller.GetUserId(), caller.IsAdmin(), ct);
                    return result.Status switch
                    {
                        UpdateRequestStatus.Success => Results.Ok(result.Response),
                        UpdateRequestStatus.NotFound => Results.NotFound(),
                        UpdateRequestStatus.Forbidden => Results.Forbid(),
                        _ => Results.Problem()
                    };
                })
            .RequireAuthorization()
            .WithName("UpdateRequest")
            .WithTags("Requests")
            .Produces<BloodRequestResponse>()
            .Produces(StatusCodes.Status404NotFound)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .ProducesValidationProblem();
    }
}
