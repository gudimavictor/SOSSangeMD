using Backend.Api.Common.Endpoints;
using Backend.Api.Domain.Entities;
using Backend.Api.Infrastructure.Persistence;
using FluentValidation;

namespace Backend.Api.Features.Centers.CreateCenter;

public record CreateCenterRequest(
    string Name,
    string City,
    string Address,
    string Phone,
    string Schedule,
    double Lat,
    double Lng);

public record CenterResponse(
    int Id,
    string Name,
    string City,
    string Address,
    string Phone,
    string Schedule,
    double Lat,
    double Lng);

public class CreateCenterValidator : AbstractValidator<CreateCenterRequest>
{
    public CreateCenterValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.City).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Address).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Schedule).NotEmpty().MaximumLength(200);
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
            Name = request.Name,
            City = request.City,
            Address = request.Address,
            Phone = request.Phone,
            Schedule = request.Schedule,
            Lat = request.Lat,
            Lng = request.Lng
        };

        db.TransfusionCenters.Add(center);
        await db.SaveChangesAsync(cancellationToken);

        return new CenterResponse(center.Id, center.Name, center.City, center.Address, center.Phone,
            center.Schedule, center.Lat, center.Lng);
    }
}

public class CreateCenterEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/centers/create",
                async (CreateCenterRequest request, CreateCenterValidator validator, CreateCenterHandler handler,
                    CancellationToken ct) =>
                {
                    var validationResult = await validator.ValidateAsync(request, ct);
                    if (!validationResult.IsValid)
                    {
                        return Results.ValidationProblem(validationResult.ToDictionary());
                    }

                    var response = await handler.Handle(request, ct);
                    return Results.Created($"/api/centers/get/{response.Id}", response);
                })
            .RequireAuthorization("AdminOnly")
            .WithName("CreateCenter")
            .WithTags("Centers")
            .Produces<CenterResponse>(StatusCodes.Status201Created)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status403Forbidden)
            .ProducesValidationProblem();
    }
}
