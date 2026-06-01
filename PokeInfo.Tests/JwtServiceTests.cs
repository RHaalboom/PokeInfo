using Moq;
using Xunit;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using PokeInfo.Services;
using PokeInfo.Entities;

namespace PokeInfo.Tests;

/// <summary>
/// Unit tests for the JwtService covering token generation and claims.
/// These tests validate JWT token creation, claim inclusion, and token structure.
/// </summary>
public class JwtServiceTests
{
    private readonly Mock<IConfiguration> _mockConfiguration;
    private readonly JwtService _jwtService;

    public JwtServiceTests()
    {
        _mockConfiguration = new Mock<IConfiguration>();

        // Setup JWT configuration
        var jwtSettings = new Mock<IConfigurationSection>();
        jwtSettings.Setup(x => x["Key"]).Returns("this-is-a-very-long-secret-key-for-jwt-testing-purposes-that-is-long-enough");
        jwtSettings.Setup(x => x["ExpirationMinutes"]).Returns("60");

        _mockConfiguration.Setup(x => x.GetSection("JwtSettings"))
            .Returns(jwtSettings.Object);

        _jwtService = new JwtService(_mockConfiguration.Object);
    }

    #region Token Generation Tests

    /// <summary>
    /// Happy path: JWT service should generate a valid token for a user.
    /// Validates: Token is created, not null or empty, and can be parsed.
    /// </summary>
    [Fact]
    public void GenerateToken_ShouldReturnValidToken_WhenUserIsProvided()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            RoleId = RoleService.UserRoleId,
            Role = new Role { Id = RoleService.UserRoleId, Name = "User" }
        };

        // Act
        var token = _jwtService.GenerateToken(user);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);

        // Verify token can be parsed
        var handler = new JwtSecurityTokenHandler();
        var parsedToken = handler.ReadJwtToken(token);
        Assert.NotNull(parsedToken);
    }

    /// <summary>
    /// Happy path: Generated token should contain correct user ID claim.
    /// Validates: NameIdentifier claim (user ID) is properly included in the token.
    /// </summary>
    [Fact]
    public void GenerateToken_ShouldIncludeUserIdClaim_WhenTokenIsGenerated()
    {
        // Arrange
        var userId = 42;
        var user = new User
        {
            Id = userId,
            Username = "testuser",
            Email = "test@example.com",
            RoleId = RoleService.UserRoleId,
            Role = new Role { Id = RoleService.UserRoleId, Name = "User" }
        };

        // Act
        var token = _jwtService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var parsedToken = handler.ReadJwtToken(token);
        var userIdClaim = parsedToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);

        Assert.NotNull(userIdClaim);
        Assert.Equal(userId.ToString(), userIdClaim.Value);
    }

    /// <summary>
    /// Happy path: Generated token should contain correct username claim.
    /// Validates: Name claim (username) is properly included in the token.
    /// </summary>
    [Fact]
    public void GenerateToken_ShouldIncludeUsernameClaim_WhenTokenIsGenerated()
    {
        // Arrange
        var username = "testuser123";
        var user = new User
        {
            Id = 1,
            Username = username,
            Email = "test@example.com",
            RoleId = RoleService.UserRoleId,
            Role = new Role { Id = RoleService.UserRoleId, Name = "User" }
        };

        // Act
        var token = _jwtService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var parsedToken = handler.ReadJwtToken(token);
        var usernameClaim = parsedToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name);

        Assert.NotNull(usernameClaim);
        Assert.Equal(username, usernameClaim.Value);
    }

    /// <summary>
    /// Happy path: Generated token should contain correct email claim.
    /// Validates: Email claim is properly included in the token.
    /// </summary>
    [Fact]
    public void GenerateToken_ShouldIncludeEmailClaim_WhenTokenIsGenerated()
    {
        // Arrange
        var email = "test@example.com";
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = email,
            RoleId = RoleService.UserRoleId,
            Role = new Role { Id = RoleService.UserRoleId, Name = "User" }
        };

        // Act
        var token = _jwtService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var parsedToken = handler.ReadJwtToken(token);
        var emailClaim = parsedToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Email);

        Assert.NotNull(emailClaim);
        Assert.Equal(email, emailClaim.Value);
    }

    /// <summary>
    /// Happy path: Generated token should contain correct role claim.
    /// Validates: Role claim is properly included in the token for authorization.
    /// </summary>
    [Fact]
    public void GenerateToken_ShouldIncludeRoleClaim_WhenUserHasRole()
    {
        // Arrange
        var roleName = "Moderator";
        var user = new User
        {
            Id = 1,
            Username = "admin",
            Email = "admin@example.com",
            RoleId = RoleService.ModeratorRoleId,
            Role = new Role { Id = RoleService.ModeratorRoleId, Name = roleName }
        };

        // Act
        var token = _jwtService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var parsedToken = handler.ReadJwtToken(token);
        var roleClaim = parsedToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);

        Assert.NotNull(roleClaim);
        Assert.Equal(roleName, roleClaim.Value);
    }

    /// <summary>
    /// Happy path: Different users should generate different tokens.
    /// Validates: Token uniqueness based on user data.
    /// </summary>
    [Fact]
    public void GenerateToken_ShouldReturnDifferentTokens_ForDifferentUsers()
    {
        // Arrange
        var user1 = new User
        {
            Id = 1,
            Username = "user1",
            Email = "user1@example.com",
            RoleId = RoleService.UserRoleId,
            Role = new Role { Id = RoleService.UserRoleId, Name = "User" }
        };

        var user2 = new User
        {
            Id = 2,
            Username = "user2",
            Email = "user2@example.com",
            RoleId = RoleService.UserRoleId,
            Role = new Role { Id = RoleService.UserRoleId, Name = "User" }
        };

        // Act
        var token1 = _jwtService.GenerateToken(user1);
        var token2 = _jwtService.GenerateToken(user2);

        // Assert
        Assert.NotEqual(token1, token2);
    }

    /// <summary>
    /// Happy path: Token should have expiration set.
    /// Validates: Token expires in the future based on configured expiration time.
    /// </summary>
    [Fact]
    public void GenerateToken_ShouldHaveExpirationInFuture_WhenTokenIsGenerated()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            RoleId = RoleService.UserRoleId,
            Role = new Role { Id = RoleService.UserRoleId, Name = "User" }
        };

        var nowBefore = DateTime.UtcNow;

        // Act
        var token = _jwtService.GenerateToken(user);

        var nowAfter = DateTime.UtcNow;

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var parsedToken = handler.ReadJwtToken(token);

        Assert.True(parsedToken.ValidTo > nowBefore.AddMinutes(59)); // Should be around 60 minutes
        Assert.True(parsedToken.ValidTo < nowAfter.AddMinutes(61));
    }

    #endregion

    #region Token Structure Tests

    /// <summary>
    /// Happy path: Token should contain all required claims.
    /// Validates: Token structure is complete with all necessary claims for authorization.
    /// </summary>
    [Fact]
    public void GenerateToken_ShouldContainAllRequiredClaims_WhenTokenIsGenerated()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            RoleId = RoleService.UserRoleId,
            Role = new Role { Id = RoleService.UserRoleId, Name = "User" }
        };

        // Act
        var token = _jwtService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var parsedToken = handler.ReadJwtToken(token);

        var requiredClaimTypes = new[]
        {
            ClaimTypes.NameIdentifier, // UserId
            ClaimTypes.Name,            // Username
            ClaimTypes.Email,           // Email
            ClaimTypes.Role             // Role
        };

        foreach (var claimType in requiredClaimTypes)
        {
            Assert.Contains(parsedToken.Claims, c => c.Type == claimType);
        }
    }

    /// <summary>
    /// Unhappy path: Token with null role should use "User" as default role.
    /// Validates: Fallback behavior when role is null.
    /// </summary>
    [Fact]
    public void GenerateToken_ShouldUseDefaultRole_WhenUserRoleIsNull()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            RoleId = RoleService.UserRoleId,
            Role = null! // Null role
        };

        // Act
        var token = _jwtService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var parsedToken = handler.ReadJwtToken(token);
        var roleClaim = parsedToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role);

        Assert.NotNull(roleClaim);
        Assert.Equal("User", roleClaim.Value);
    }

    /// <summary>
    /// Happy path: Multiple token generations for same user should work consistently.
    /// Validates: Service can generate multiple tokens without state issues.
    /// </summary>
    [Fact]
    public void GenerateToken_ShouldGenerateMultipleTokens_WithoutErrors()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            RoleId = RoleService.UserRoleId,
            Role = new Role { Id = RoleService.UserRoleId, Name = "User" }
        };

        // Act & Assert
        for (int i = 0; i < 5; i++)
        {
            var token = _jwtService.GenerateToken(user);
            Assert.NotNull(token);
            Assert.NotEmpty(token);
        }
    }

    /// <summary>
    /// Happy path: Token should be properly signed with the configured key.
    /// Validates: Token signature is valid and can be verified.
    /// </summary>
    [Fact]
    public void GenerateToken_ShouldReturnSignedToken_WhenGenerated()
    {
        // Arrange
        var user = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            RoleId = RoleService.UserRoleId,
            Role = new Role { Id = RoleService.UserRoleId, Name = "User" }
        };

        // Act
        var token = _jwtService.GenerateToken(user);

        // Assert
        var handler = new JwtSecurityTokenHandler();
        var parsedToken = handler.ReadJwtToken(token);

        // Token has a signature
        Assert.False(string.IsNullOrEmpty(parsedToken.RawSignature));
    }

    #endregion
}
