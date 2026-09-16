using Backend.Api.Common.Endpoints;
using Backend.Api.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Backend.Api.Features.Centers.GetCenterById;

public record CenterResponse(
    int Id,
    string Name,
    string City,
    string Address,
    string Phone,
    string Schedule,
    double Lat,
    double Lng);

public class GetCenterByIdHandler(AppDbContext db)
{
    public async Task<CenterResponse?> Handle(int id, CancellationToken cancellationToken)
    {
        return await db.TransfusionCenters
            .Where(c => c.Id == id)
            .Select(c => new CenterResponse(c.Id, c.Name, c.City, c.Address, c.Phone, c.Schedule, c.Lat, c.Lng))
            .FirstOrDefaultAsync(cancellationToken);
    }
}

public class GetCenterByIdEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/centers/get/{id:int}", async (int id, GetCenterByIdHandler handler, CancellationToken ct) =>
            {
                var center = await handler.Handle(id, ct);
                return center is not null ? Results.Ok(center) : Results.NotFound();
            })
            .WithName("GetCenterById")
            .WithTags("Centers")
            .Produces<CenterResponse>()
            .Produces(StatusCodes.Status404NotFound);
    }
}
