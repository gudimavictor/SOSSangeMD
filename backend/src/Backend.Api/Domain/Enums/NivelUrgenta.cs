using System.Text.Json.Serialization;

namespace Backend.Api.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum NivelUrgenta
{
    Critica,
    Urgenta,
    Programata
}
