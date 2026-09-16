using System.Security.Cryptography;

namespace Backend.Api.Infrastructure.Auth;

public class RefreshTokenGenerator
{
    public string Generate() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
}
