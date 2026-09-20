namespace Backend.Api.Domain.Services;

public static class DonorEligibility
{
    private const int MinMonthsBetweenDonations = 2;

    public static bool IsEligible(DateOnly? lastDonationDate, DateOnly today) =>
        lastDonationDate is null || lastDonationDate.Value.AddMonths(MinMonthsBetweenDonations) <= today;
}
