using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Centers.ListCenters;

public record CenterResponse(
    int Id,
    string Name,
    string City,
    string Address,
    string Phone,
    string Schedule,
    double Lat,
    double Lng);

public class ListCentersHandler(AppDbContext db)
{
    public async Task<IReadOnlyList<CenterResponse>> Handle(CancellationToken cancellationToken)
    {
        return await db.TransfusionCenters
            .OrderBy(c => c.Name)
            .Select(c => new CenterResponse(c.Id, c.Name, c.City, c.Address, c.Phone, c.Schedule, c.Lat, c.Lng))
            .ToListAsync(cancellationToken);
    }
}

public class ListCentersEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/centers/list", async (ListCentersHandler handler, CancellationToken ct) =>
            {
                var centers = await handler.Handle(ct);
                return Results.Ok(centers);
            })
            .WithName("ListCenters")
            .WithTags("Centers")
            .Produces<IReadOnlyList<CenterResponse>>();
    }
}
