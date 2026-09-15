using Backend.Api.Common.Endpoints;
using Backend.Api.Common.Validation;
using Backend.Api.Domain.Entities;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Requests.CreateRequest;

public record CreateRequestRequest(
    int SolicitantId,
    GrupaSanguina GrupaNecesara,
    string Oras,
    NivelUrgenta Urgenta,
    string Descriere);

public record BloodRequestResponse(
    int Id,
    int SolicitantId,
    string SolicitantNume,
    GrupaSanguina GrupaNecesara,
    string Oras,
    NivelUrgenta Urgenta,
    string Descriere,
    StatusCerere Status,
    DateTime DataCreare);

public class CreateRequestValidator : AbstractValidator<CreateRequestRequest>
{
    public CreateRequestValidator(AppDbContext db)
    {
        RuleFor(x => x.SolicitantId)
            .MustAsync(async (id, cancellationToken) => await db.Users.AnyAsync(u => u.Id == id, cancellationToken))
            .WithMessage("Solicitantul nu există.");
        RuleFor(x => x.Oras).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Descriere).NotEmpty().MaximumLength(1000);
    }
}

public class CreateRequestHandler(AppDbContext db)
{
    public async Task<BloodRequestResponse> Handle(CreateRequestRequest request, CancellationToken cancellationToken)
    {
        var entity = new BloodRequest
        {
            SolicitantId = request.SolicitantId,
            GrupaNecesara = request.GrupaNecesara,
            Oras = request.Oras,
            Urgenta = request.Urgenta,
            Descriere = request.Descriere,
            Status = StatusCerere.Activa,
            DataCreare = DateTime.UtcNow
        };

        db.BloodRequests.Add(entity);
        await db.SaveChangesAsync(cancellationToken);

        var solicitant = await db.Users.FirstAsync(u => u.Id == entity.SolicitantId, cancellationToken);

        return new BloodRequestResponse(entity.Id, entity.SolicitantId, solicitant.Nume, entity.GrupaNecesara,
            entity.Oras, entity.Urgenta, entity.Descriere, entity.Status, entity.DataCreare);
    }
}

public class CreateRequestEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/requests/create",
                async (CreateRequestRequest request, CreateRequestHandler handler, CancellationToken ct) =>
                {
                    var response = await handler.Handle(request, ct);
                    return Results.Created($"/api/requests/get/{response.Id}", response);
                })
            .WithRequestValidation<CreateRequestRequest>()
            .WithName("CreateRequest")
            .WithTags("Requests")
            .Produces<BloodRequestResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem();
    }
}
