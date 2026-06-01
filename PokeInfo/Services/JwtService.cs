using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using PokeInfo.Entities;

namespace PokeInfo.Services;

public class JwtService
{
    private readonly string _key;
    private readonly int _expirationMinutes;

    public JwtService(IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("JwtSettings");
        _key = jwtSettings["Key"] ?? throw new ArgumentNullException("JwtSettings:Key");
        _expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "60");
    }

    public string GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role?.Name ?? "User")
        };

        // Add Ranked claim only if user is ranked
        if (user.Ranked.HasValue && user.Ranked == 1)
        {
            claims.Add(new Claim("Ranked", "1"));
        }

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_expirationMinutes),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
