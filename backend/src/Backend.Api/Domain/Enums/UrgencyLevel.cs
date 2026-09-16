using System.Text.Json.Serialization;

namespace Backend.Api.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum UrgencyLevel
{
    Critical,
    Urgent,
    Scheduled
}
