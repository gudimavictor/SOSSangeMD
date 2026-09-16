using System.Text.Json.Serialization;

namespace Backend.Api.Domain.Enums;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum BloodType
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
