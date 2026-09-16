using System.Text.Json.Serialization;

namespace Backend.Api.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RequestStatus
{
    Active,
    Resolved,
    Expired
}
