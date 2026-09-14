using System.Text.Json.Serialization;

namespace Backend.Api.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum GrupaSanguina
{
    OMinus,
    OPlus,
    AMinus,
    APlus,
    BMinus,
    BPlus,
    ABMinus,
    ABPlus
}
