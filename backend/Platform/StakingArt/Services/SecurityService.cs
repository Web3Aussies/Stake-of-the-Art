using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using Nethereum.Hex.HexConvertors.Extensions;
using StakingArt.Infrastructure.Security;

namespace StakingArt.Services;

public interface ISecurityService
{
    public (string token, long expiresIn) GenerateJwtToken(string userId, Claim[]? claims = null);
}

public class SecurityService : ISecurityService
{
    readonly IRepository _repository;
    readonly SecurityOptions _options;

    public SecurityService(IRepository repository, SecurityOptions options)
    {
        _repository = repository;
        _options = options;
    }


    public (string token, long expiresIn) GenerateJwtToken(string userId, Claim[]? claims = null)
    {
        var securityKey = new SymmetricSecurityKey(_options.SecretKey.HexToByteArray());

        List<Claim> allClaims =
        [
            ..claims??[],
            new(JwtRegisteredClaimNames.Sub, userId)
        ];

        var tokenHandler = new JwtSecurityTokenHandler();
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(allClaims),
            Expires = DateTime.UtcNow.AddSeconds(_options.Expires),
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            SigningCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return (tokenHandler.WriteToken(token), _options.Expires);
    }
}
