using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Centers.UpdateCenter;

public record UpdateCenterRequest(
    string Nume,
    string Oras,
    string Adresa,
    string Telefon,
    string Program,
    double Lat,
    double Lng);

public record CenterResponse(
    int Id,
    string Nume,
    string Oras,
    string Adresa,
    string Telefon,
    string Program,
    double Lat,
    double Lng);

public class UpdateCenterValidator : AbstractValidator<UpdateCenterRequest>
{
    public UpdateCenterValidator()
    {
        RuleFor(x => x.Nume).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Oras).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Adresa).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Telefon).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Program).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Lat).InclusiveBetween(-90, 90);
        RuleFor(x => x.Lng).InclusiveBetween(-180, 180);
    }
}

public class UpdateCenterHandler(AppDbContext db)
{
    public async Task<CenterResponse?> Handle(int id, UpdateCenterRequest request, CancellationToken cancellationToken)
    {
        var center = await db.TransfusionCenters.FirstOrDefaultAsync(c => c.Id == id, cancellationToken);
        if (center is null)
        {
            return null;
        }

        center.Nume = request.Nume;
        center.Oras = request.Oras;
        center.Adresa = request.Adresa;
        center.Telefon = request.Telefon;
        center.Program = request.Program;
        center.Lat = request.Lat;
        center.Lng = request.Lng;

        await db.SaveChangesAsync(cancellationToken);

        return new CenterResponse(center.Id, center.Nume, center.Oras, center.Adresa, center.Telefon,
            center.Program, center.Lat, center.Lng);
    }
}

public class UpdateCenterEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPut("/api/centers/update/{id:int}",
                async (int id, UpdateCenterRequest request, UpdateCenterValidator validator,
                    UpdateCenterHandler handler, CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var response = await handler.Handle(id, request, ct);
                    return response is not null ? Results.Ok(response) : Results.NotFound();
                })
            .WithName("UpdateCenter")
            .WithTags("Centers")
            .Produces<CenterResponse>()
            .Produces(StatusCodes.Status404NotFound)
            .ProducesValidationProblem();
    }
}
