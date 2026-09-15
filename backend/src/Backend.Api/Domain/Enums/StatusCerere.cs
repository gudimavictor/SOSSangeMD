using System.Text.Json.Serialization;

namespace Backend.Api.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum StatusCerere
{
    Activa,
    Rezolvata,
    Expirata
}
