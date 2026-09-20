using System.Security.Claims;
using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Domain.Enums;
using Backend.Api.Domain.Services;
using Backend.Api.Infrastructure.Auth;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Responses.CreateResponse;

public record CreateResponseRequest(
    int BloodRequestId,
    ResponseStatus Status);

public record DonorResponse(
    int Id,
    int BloodRequestId,
    int DonorId,
    string DonorName,
    ResponseStatus Status,
    DateTime RespondedAt);

public class CreateResponseValidator : AbstractValidator<CreateResponseRequest>
{
    public CreateResponseValidator(AppDbContext db)
    {
        RuleFor(x => x.BloodRequestId)
            .MustAsync(async (id, cancellationToken) => await db.BloodRequests.AnyAsync(r => r.Id == id, cancellationToken))
            .WithMessage("Cererea nu există.");
    }
}

public enum CreateResponseStatus
{
    Success,
    AlreadyResponded,
    OwnRequest,
    RequestNotActive,
    IncompatibleDonor,
    NotEligibleYet
}

public record CreateResponseResult(CreateResponseStatus Status, DonorResponse? Response = null)
{
    public static CreateResponseResult Success(DonorResponse response) => new(CreateResponseStatus.Success, response);
    public static CreateResponseResult AlreadyResponded() => new(CreateResponseStatus.AlreadyResponded);
    public static CreateResponseResult OwnRequest() => new(CreateResponseStatus.OwnRequest);
    public static CreateResponseResult RequestNotActive() => new(CreateResponseStatus.RequestNotActive);
    public static CreateResponseResult IncompatibleDonor() => new(CreateResponseStatus.IncompatibleDonor);
    public static CreateResponseResult NotEligibleYet() => new(CreateResponseStatus.NotEligibleYet);
}

public class CreateResponseHandler(AppDbContext db)
{
    public async Task<CreateResponseResult> Handle(CreateResponseRequest request, int donorId,
        CancellationToken cancellationToken)
    {
        var alreadyResponded = await db.RequestResponses.AnyAsync(
            r => r.BloodRequestId == request.BloodRequestId && r.DonorId == donorId, cancellationToken);
        if (alreadyResponded)
        {
            return CreateResponseResult.AlreadyResponded();
        }

        var bloodRequest = await db.BloodRequests.FirstAsync(r => r.Id == request.BloodRequestId, cancellationToken);
        var donor = await db.Users.FirstAsync(u => u.Id == donorId, cancellationToken);

        if (bloodRequest.RequesterId == donorId)
        {
            return CreateResponseResult.OwnRequest();
        }

        if (bloodRequest.Status != RequestStatus.Active)
        {
            return CreateResponseResult.RequestNotActive();
        }

        if (request.Status == ResponseStatus.Available)
        {
            if (!donor.IsDonor || donor.BloodType is null ||
                !BloodCompatibility.IsCompatible(donor.BloodType.Value, bloodRequest.RequiredBloodType))
            {
                return CreateResponseResult.IncompatibleDonor();
            }

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            if (!DonorEligibility.IsEligible(donor.LastDonationDate, today))
            {
                return CreateResponseResult.NotEligibleYet();
            }

            donor.LastDonationDate = today;
        }

        var entity = new RequestResponse
        {
            BloodRequestId = request.BloodRequestId,
            DonorId = donorId,
            Status = request.Status,
            RespondedAt = DateTime.UtcNow
        };

        db.RequestResponses.Add(entity);

        db.Notifications.Add(new Notification
        {
            UserId = bloodRequest.RequesterId,
            Type = NotificationType.Confirmation,
            Title = "Cineva a răspuns la cererea ta",
            Message = $"{donor.Name} a răspuns la cererea ta de sânge din {bloodRequest.City}.",
            IsRead = false,
            CreatedAt = DateTime.UtcNow,
            Link = "/cererile-mele"
        });

        await db.SaveChangesAsync(cancellationToken);

        var response = new DonorResponse(entity.Id, entity.BloodRequestId, entity.DonorId, donor.Name, entity.Status,
            entity.RespondedAt);
        return CreateResponseResult.Success(response);
    }
}

public class CreateResponseEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/responses/create",
                async (CreateResponseRequest request, ClaimsPrincipal caller, CreateResponseValidator validator,
                    CreateResponseHandler handler, CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var result = await handler.Handle(request, caller.GetUserId(), ct);
                    return result.Status switch
                    {
                        CreateResponseStatus.Success =>
                            Results.Created($"/api/responses/get/{result.Response!.Id}", result.Response),
                        CreateResponseStatus.AlreadyResponded =>
                            Results.Conflict("Ai răspuns deja la această cerere."),
                        CreateResponseStatus.OwnRequest =>
                            Results.Conflict("Nu poți răspunde la propria cerere."),
                        CreateResponseStatus.RequestNotActive =>
                            Results.Conflict("Cererea nu mai este activă."),
                        CreateResponseStatus.IncompatibleDonor =>
                            Results.Conflict("Grupa ta sanguină nu este compatibilă cu această cerere."),
                        CreateResponseStatus.NotEligibleYet =>
                            Results.Conflict("Nu au trecut încă 2 luni de la ultima ta donare."),
                        _ => Results.Problem()
                    };
                })
            .RequireAuthorization()
            .WithName("CreateResponse")
            .WithTags("Responses")
            .Produces<DonorResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status409Conflict)
            .ProducesValidationProblem();
    }
}
