using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Backend.Api.Infrastructure.Auth;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user) =>
        int.Parse(user.FindFirstValue(JwtRegisteredClaimNames.Sub)!);

    public static bool IsAdmin(this ClaimsPrincipal user) =>
        user.FindFirstValue("isAdmin") == "True";
}
