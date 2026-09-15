using System.Reflection;

namespace Backend.Api.Common.Endpoints;

public static class EndpointExtensions
{
    public static IServiceCollection AddEndpoints(this IServiceCollection services, Assembly assembly)
    {
        var endpointTypes = assembly.GetTypes()
            .Where(t => t is { IsAbstract: false, IsInterface: false } && typeof(IEndpoint).IsAssignableFrom(t))
            .ToList();

        foreach (var type in endpointTypes)
        {
            services.AddTransient(typeof(IEndpoint), type);
        }

        return services;
    }

    public static IApplicationBuilder MapEndpoints(this WebApplication app)
    {
        var endpoints = app.Services.GetServices<IEndpoint>();

        foreach (var endpoint in endpoints)
        {
            endpoint.MapEndpoint(app);
        }

        return app;
    }

    public static IServiceCollection AddHandlers(this IServiceCollection services, Assembly assembly)
    {
        var handlerTypes = assembly.GetTypes()
            .Where(t => t is { IsAbstract: false, IsInterface: false, IsClass: true } &&
                        t.Name.EndsWith("Handler", StringComparison.Ordinal));

        foreach (var type in handlerTypes)
        {
            services.AddScoped(type);
        }

        return services;
    }

    public static IServiceCollection AddValidators(this IServiceCollection services, Assembly assembly)
    {
        var validatorTypes = assembly.GetTypes()
            .Where(t => t is { IsAbstract: false, IsInterface: false, IsClass: true } &&
                        t.Name.EndsWith("Validator", StringComparison.Ordinal));

        foreach (var type in validatorTypes)
        {
            services.AddScoped(type);
        }

        return services;
    }
}
