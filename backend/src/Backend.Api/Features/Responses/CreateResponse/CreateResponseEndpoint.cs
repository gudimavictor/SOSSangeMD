using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Responses.CreateResponse;

public record CreateResponseRequest(
    int BloodRequestId,
    int DonatorId,
    StatusRaspuns Status);

public record DonorResponse(
    int Id,
    int BloodRequestId,
    int DonatorId,
    string DonatorNume,
    StatusRaspuns Status,
    DateTime Data);

public class CreateResponseValidator : AbstractValidator<CreateResponseRequest>
{
    public CreateResponseValidator(AppDbContext db)
    {
        RuleFor(x => x.BloodRequestId)
            .MustAsync(async (id, cancellationToken) => await db.BloodRequests.AnyAsync(r => r.Id == id, cancellationToken))
            .WithMessage("Cererea nu există.");

        RuleFor(x => x.DonatorId)
            .MustAsync(async (id, cancellationToken) => await db.Users.AnyAsync(u => u.Id == id, cancellationToken))
            .WithMessage("Donatorul nu există.")
            .MustAsync(async (request, donatorId, cancellationToken) => !await db.RequestResponses.AnyAsync(
                r => r.BloodRequestId == request.BloodRequestId && r.DonatorId == donatorId, cancellationToken))
            .WithMessage("Acest donator a răspuns deja la această cerere.");
    }
}

public class CreateResponseHandler(AppDbContext db)
{
    public async Task<DonorResponse> Handle(CreateResponseRequest request, CancellationToken cancellationToken)
    {
        var entity = new RequestResponse
        {
            BloodRequestId = request.BloodRequestId,
            DonatorId = request.DonatorId,
            Status = request.Status,
            Data = DateTime.UtcNow
        };

        db.RequestResponses.Add(entity);

        var bloodRequest = await db.BloodRequests.FirstAsync(r => r.Id == request.BloodRequestId, cancellationToken);
        var donator = await db.Users.FirstAsync(u => u.Id == request.DonatorId, cancellationToken);

        db.Notificari.Add(new Notificare
        {
            UserId = bloodRequest.SolicitantId,
            Tip = TipNotificare.Confirmare,
            Titlu = "Cineva a răspuns la cererea ta",
            Mesaj = $"{donator.Nume} a răspuns la cererea ta de sânge din {bloodRequest.Oras}.",
            Citita = false,
            Data = DateTime.UtcNow,
            Link = "/cererile-mele"
        });

        await db.SaveChangesAsync(cancellationToken);

        return new DonorResponse(entity.Id, entity.BloodRequestId, entity.DonatorId, donator.Nume, entity.Status,
            entity.Data);
    }
}

public class CreateResponseEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/responses/create",
                async (CreateResponseRequest request, CreateResponseValidator validator,
                    CreateResponseHandler handler, CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var response = await handler.Handle(request, ct);
                    return Results.Created($"/api/responses/get/{response.Id}", response);
                })
            .WithName("CreateResponse")
            .WithTags("Responses")
            .Produces<DonorResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem();
    }
}
