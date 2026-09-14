using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Centers.ListCenters;

public record CenterResponse(
    int Id,
    string Nume,
    string Oras,
    string Adresa,
    string Telefon,
    string Program,
    double Lat,
    double Lng);

public class ListCentersHandler(AppDbContext db)
{
    public async Task<IReadOnlyList<CenterResponse>> Handle(CancellationToken cancellationToken)
    {
        return await db.TransfusionCenters
            .OrderBy(c => c.Nume)
            .Select(c => new CenterResponse(c.Id, c.Nume, c.Oras, c.Adresa, c.Telefon, c.Program, c.Lat, c.Lng))
            .ToListAsync(cancellationToken);
    }
}

public class ListCentersEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/centers", async (ListCentersHandler handler, CancellationToken ct) =>
            {
                var centers = await handler.Handle(ct);
                return Results.Ok(centers);
            })
            .WithName("ListCenters")
            .WithTags("Centers")
            .Produces<IReadOnlyList<CenterResponse>>();
    }
}
