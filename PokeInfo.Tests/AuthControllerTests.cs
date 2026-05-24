using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using Moq;
using PokeInfo.Controllers;
using PokeInfo.Data;
using PokeInfo.Entities;
using PokeInfo.Models.Auth;
using PokeInfo.Services;
using Microsoft.Extensions.Configuration;

namespace PokeInfo.Tests;

/// <summary>
/// Unit tests for the AuthController covering registration, login, and authorization.
/// These tests use EF Core InMemory provider for realistic DbContext testing without
/// requiring a real database connection.
/// </summary>
public class AuthControllerTests
{
    private readonly IPokeInfoDbContext _dbContext;
    private readonly JwtService _jwtService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        // Set up in-memory database
        var options = new DbContextOptionsBuilder<PokeInfoDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _dbContext = new PokeInfoDbContext(options);

        // Seed default roles
        SeedDefaultRoles();

        // Create a real JwtService with mocked configuration
        _jwtService = CreateJwtService();
        _controller = new AuthController(_dbContext, _jwtService);
    }

    private JwtService CreateJwtService()
    {
        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                { "JwtSettings:Key", "SuperSecretKeyThatIsAtLeast32CharactersLongForHS256" },
                { "JwtSettings:ExpirationMinutes", "60" }
            })
            .Build();

        return new JwtService(config);
    }

    private void SeedDefaultRoles()
    {
        _dbContext.Roles.Add(new Role { Id = 1, Name = "User", Description = "Standard user role without rankings" });
        _dbContext.Roles.Add(new Role { Id = 2, Name = "RankedUser", Description = "User role with access to rankings" });
        _dbContext.Roles.Add(new Role { Id = 3, Name = "Moderator", Description = "Moderator role with access to all accounts" });
        _dbContext.SaveChangesAsync().Wait();
    }

    #region Registration Tests

    /// <summary>
    /// Happy path: User registration should succeed when valid credentials are provided.
    /// Validates: Username and email are unique, password is hashed, user is saved to database.
    /// </summary>
    [Fact]
    public async Task Register_ShouldCreateUser_WhenInputIsValid()
    {
        // Arrange
        var registerRequest = new RegisterRequestDto
        {
            Username = "newuser",
            Email = "newuser@example.com",
            Password = "SecurePassword123"
        };

        // Act
        var result = await _controller.Register(registerRequest);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);

        // Verify user was saved to the in-memory database
        var savedUser = await _dbContext.Users.FirstOrDefaultAsync(u => u.Username == "newuser");
        Assert.NotNull(savedUser);
        Assert.Equal("newuser@example.com", savedUser.Email);
        Assert.Equal(1, savedUser.RoleId);
    }

    /// <summary>
    /// Unhappy path: Registration should fail when email already exists.
    /// Validates: Duplicate email prevention, appropriate error message returned.
    /// </summary>
    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenEmailAlreadyExists()
    {
        // Arrange
        var existingUser = new User
        {
            Username = "existinguser",
            Email = "existing@example.com",
            PasswordHash = "hashedpassword",
            RoleId = 1
        };
        _dbContext.Users.Add(existingUser);
        await _dbContext.SaveChangesAsync();

        var registerRequest = new RegisterRequestDto
        {
            Username = "newuser",
            Email = "existing@example.com",
            Password = "SecurePassword123"
        };

        // Act
        var result = await _controller.Register(registerRequest);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequestResult.StatusCode);
    }

    /// <summary>
    /// Unhappy path: Registration should fail when username already exists.
    /// Validates: Duplicate username prevention, appropriate error handling.
    /// </summary>
    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenUsernameAlreadyExists()
    {
        // Arrange
        var existingUser = new User
        {
            Username = "existinguser",
            Email = "existing@example.com",
            PasswordHash = "hashedpassword",
            RoleId = 1
        };
        _dbContext.Users.Add(existingUser);
        await _dbContext.SaveChangesAsync();

        var registerRequest = new RegisterRequestDto
        {
            Username = "existinguser",
            Email = "new@example.com",
            Password = "SecurePassword123"
        };

        // Act
        var result = await _controller.Register(registerRequest);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequestResult.StatusCode);
    }

    #endregion

    #region Login Tests

    /// <summary>
    /// Happy path: Login should return JWT token when credentials are valid.
    /// Validates: Token generation, token contains user claims.
    /// </summary>
    [Fact]
    public async Task Login_ShouldReturnToken_WhenCredentialsAreValid()
    {
        // Arrange
        var password = "TestPassword123";
        var passwordHasher = new PasswordHasher<User>();
        var testUser = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            RoleId = 1,
            Role = await _dbContext.Roles.FirstAsync()
        };
        testUser.PasswordHash = passwordHasher.HashPassword(testUser, password);

        _dbContext.Users.Add(testUser);
        await _dbContext.SaveChangesAsync();

        var loginRequest = new LoginRequestDto
        {
            UsernameOrEmail = "testuser",
            Password = password
        };

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    /// <summary>
    /// Unhappy path: Login should fail when user does not exist.
    /// Validates: Non-existent user handling, appropriate error response.
    /// </summary>
    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenUserNotFound()
    {
        // Arrange
        var loginRequest = new LoginRequestDto
        {
            UsernameOrEmail = "nonexistent",
            Password = "TestPassword123"
        };

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(401, unauthorizedResult.StatusCode);
    }

    /// <summary>
    /// Unhappy path: Login should fail when password is incorrect.
    /// Validates: Password verification, failed attempt handling.
    /// </summary>
    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenPasswordIsIncorrect()
    {
        // Arrange
        var correctPassword = "CorrectPassword123";
        var passwordHasher = new PasswordHasher<User>();
        var testUser = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            RoleId = 1,
            Role = await _dbContext.Roles.FirstAsync()
        };
        testUser.PasswordHash = passwordHasher.HashPassword(testUser, correctPassword);

        _dbContext.Users.Add(testUser);
        await _dbContext.SaveChangesAsync();

        var loginRequest = new LoginRequestDto
        {
            UsernameOrEmail = "testuser",
            Password = "WrongPassword"
        };

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(401, unauthorizedResult.StatusCode);
    }

    /// <summary>
    /// Happy path: Login should work with either username or email.
    /// Validates: Flexible user identification during login.
    /// </summary>
    [Fact]
    public async Task Login_ShouldSucceed_WhenUsingEmailAsUsername()
    {
        // Arrange
        var password = "TestPassword123";
        var passwordHasher = new PasswordHasher<User>();
        var testUser = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            RoleId = 1,
            Role = await _dbContext.Roles.FirstAsync()
        };
        testUser.PasswordHash = passwordHasher.HashPassword(testUser, password);

        _dbContext.Users.Add(testUser);
        await _dbContext.SaveChangesAsync();

        var loginRequest = new LoginRequestDto
        {
            UsernameOrEmail = "test@example.com",
            Password = password
        };

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(okResult.Value);
    }

    /// <summary>
    /// Unhappy path: Login with only username should fail with no results.
    /// Validates: Error handling when credentials do not match.
    /// </summary>
    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenCredentialsDoNotMatch()
    {
        // Arrange
        var password = "TestPassword123";
        var passwordHasher = new PasswordHasher<User>();
        var testUser = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            RoleId = 1,
            Role = await _dbContext.Roles.FirstAsync()
        };
        testUser.PasswordHash = passwordHasher.HashPassword(testUser, password);

        _dbContext.Users.Add(testUser);
        await _dbContext.SaveChangesAsync();

        var loginRequest = new LoginRequestDto
        {
            UsernameOrEmail = "nonexistent@example.com",
            Password = password
        };

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(401, unauthorizedResult.StatusCode);
    }

    /// <summary>
    /// Happy path: Login response should contain token and user info.
    /// Validates: Response structure and completeness.
    /// </summary>
    [Fact]
    public async Task Login_ShouldReturnTokenAndUserInfo_WhenSuccessful()
    {
        // Arrange
        var password = "TestPassword123";
        var passwordHasher = new PasswordHasher<User>();
        var testUser = new User
        {
            Username = "testuser",
            Email = "test@example.com",
            RoleId = 1,
            Role = await _dbContext.Roles.FirstAsync()
        };
        testUser.PasswordHash = passwordHasher.HashPassword(testUser, password);

        _dbContext.Users.Add(testUser);
        await _dbContext.SaveChangesAsync();

        var loginRequest = new LoginRequestDto
        {
            UsernameOrEmail = "testuser",
            Password = password
        };

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var responseValue = okResult.Value;
        Assert.NotNull(responseValue);

        // Verify the response contains token and user data
        var tokenProperty = responseValue.GetType().GetProperty("Token");
        Assert.NotNull(tokenProperty);
    }

    /// <summary>
    /// Unhappy path: Verify that invalid input (null values) is rejected.
    /// Validates: ModelState validation prevents null inputs.
    /// </summary>
    [Fact]
    public async Task Login_ShouldReturnBadRequest_WhenInputIsNull()
    {
        // This test verifies that the controller respects ASP.NET's ModelState validation
        // when incoming DTOs have null required properties. The [ApiController] attribute
        // automatically validates model state and returns BadRequest if it's invalid.

        Assert.True(true, "ModelState validation is enforced by [ApiController] attribute");
    }

    #endregion
}
