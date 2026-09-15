using Backend.Api.Common.Endpoints;
using Backend.Api.Common.Validation;
using Backend.Api.Domain.Enums;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Requests.UpdateRequest;

public record UpdateRequestRequest(
    GrupaSanguina GrupaNecesara,
    string Oras,
    NivelUrgenta Urgenta,
    string Descriere,
    StatusCerere Status);

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

public class UpdateRequestValidator : AbstractValidator<UpdateRequestRequest>
{
    public UpdateRequestValidator()
    {
        RuleFor(x => x.Oras).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Descriere).NotEmpty().MaximumLength(1000);
    }
}

public class UpdateRequestHandler(AppDbContext db)
{
    public async Task<BloodRequestResponse?> Handle(int id, UpdateRequestRequest request,
        CancellationToken cancellationToken)
    {
        var entity = await db.BloodRequests
            .Include(r => r.Solicitant)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        if (entity is null)
        {
            return null;
        }

        entity.GrupaNecesara = request.GrupaNecesara;
        entity.Oras = request.Oras;
        entity.Urgenta = request.Urgenta;
        entity.Descriere = request.Descriere;
        entity.Status = request.Status;

        await db.SaveChangesAsync(cancellationToken);

        return new BloodRequestResponse(entity.Id, entity.SolicitantId, entity.Solicitant.Nume,
            entity.GrupaNecesara, entity.Oras, entity.Urgenta, entity.Descriere, entity.Status, entity.DataCreare);
    }
}

public class UpdateRequestEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/requests/update/{id:int}",
                async (int id, UpdateRequestRequest request, UpdateRequestHandler handler, CancellationToken ct) =>
                {
                    var response = await handler.Handle(id, request, ct);
                    return response is not null ? Results.Ok(response) : Results.NotFound();
                })
            .WithRequestValidation<UpdateRequestRequest>()
            .WithName("UpdateRequest")
            .WithTags("Requests")
            .Produces<BloodRequestResponse>()
            .Produces(StatusCodes.Status404NotFound)
            .ProducesValidationProblem();
    }
}
