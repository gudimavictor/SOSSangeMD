using Backend.Api.Domain.Enums;

namespace Backend.Api.Domain.Services;

public static class BloodCompatibility
{
    private static readonly Dictionary<BloodType, BloodType[]> CompatibleDonors = new()
    {
        [BloodType.OMinus] = [BloodType.OMinus],
        [BloodType.OPlus] = [BloodType.OMinus, BloodType.OPlus],
        [BloodType.AMinus] = [BloodType.OMinus, BloodType.AMinus],
        [BloodType.APlus] = [BloodType.OMinus, BloodType.OPlus, BloodType.AMinus, BloodType.APlus],
        [BloodType.BMinus] = [BloodType.OMinus, BloodType.BMinus],
        [BloodType.BPlus] = [BloodType.OMinus, BloodType.OPlus, BloodType.BMinus, BloodType.BPlus],
        [BloodType.ABMinus] = [BloodType.OMinus, BloodType.AMinus, BloodType.BMinus, BloodType.ABMinus],
        [BloodType.ABPlus] =
        [
            BloodType.OMinus, BloodType.OPlus, BloodType.AMinus, BloodType.APlus,
            BloodType.BMinus, BloodType.BPlus, BloodType.ABMinus, BloodType.ABPlus
        ]
    };

    public static bool IsCompatible(BloodType donorBloodType, BloodType requiredBloodType) =>
        CompatibleDonors[requiredBloodType].Contains(donorBloodType);
}
