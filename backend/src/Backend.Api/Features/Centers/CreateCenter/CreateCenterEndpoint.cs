using Backend.Api.Common.Endpoints;
using Backend.Api.Common.Validation;
using Backend.Api.Domain.Entities;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;

namespace Backend.Api.Features.Centers.CreateCenter;

public record CreateCenterRequest(
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

public class CreateCenterValidator : AbstractValidator<CreateCenterRequest>
{
    public CreateCenterValidator()
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

public class CreateCenterHandler(AppDbContext db)
{
    public async Task<CenterResponse> Handle(CreateCenterRequest request, CancellationToken cancellationToken)
    {
        var center = new TransfusionCenter
        {
            Nume = request.Nume,
            Oras = request.Oras,
            Adresa = request.Adresa,
            Telefon = request.Telefon,
            Program = request.Program,
            Lat = request.Lat,
            Lng = request.Lng
        };

        db.TransfusionCenters.Add(center);
        await db.SaveChangesAsync(cancellationToken);

        return new CenterResponse(center.Id, center.Nume, center.Oras, center.Adresa, center.Telefon,
            center.Program, center.Lat, center.Lng);
    }
}

public class CreateCenterEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/centers/create",
                async (CreateCenterRequest request, CreateCenterHandler handler, CancellationToken ct) =>
                {
                    var response = await handler.Handle(request, ct);
                    return Results.Created($"/api/centers/get/{response.Id}", response);
                })
            .WithRequestValidation<CreateCenterRequest>()
            .WithName("CreateCenter")
            .WithTags("Centers")
            .Produces<CenterResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem();
    }
}
