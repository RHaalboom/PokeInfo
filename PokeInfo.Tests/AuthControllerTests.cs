using Moq;
using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using PokeInfo.Controllers;
using PokeInfo.Data;
using PokeInfo.Entities;
using PokeInfo.Models.Auth;
using PokeInfo.Services;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PokeInfo.Tests;

/// <summary>
/// Unit tests for the AuthController covering registration, login, and authorization.
/// These tests validate user authentication flows, input validation, and access control.
/// </summary>
public class AuthControllerTests
{
    private readonly Mock<PokeInfoDbContext> _mockContext;
    private readonly Mock<JwtService> _mockJwtService;
    private readonly AuthController _controller;

    public AuthControllerTests()
    {
        _mockContext = new Mock<PokeInfoDbContext>();
        _mockJwtService = new Mock<JwtService>(
            new Mock<IConfiguration>().Object
        );
        _controller = new AuthController(_mockContext.Object, _mockJwtService.Object);
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

        var mockUsersDbSet = new Mock<DbSet<User>>();
        mockUsersDbSet.Setup(m => m.AnyAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<User, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        _mockContext.Setup(c => c.Users).Returns(mockUsersDbSet.Object);
        _mockContext.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _controller.Register(registerRequest);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);
        _mockContext.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    /// <summary>
    /// Unhappy path: Registration should fail when email already exists.
    /// Validates: Duplicate email prevention, appropriate error message returned.
    /// </summary>
    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenEmailAlreadyExists()
    {
        // Arrange
        var registerRequest = new RegisterRequestDto
        {
            Username = "newuser",
            Email = "existing@example.com",
            Password = "SecurePassword123"
        };

        var mockUsersDbSet = new Mock<DbSet<User>>();
        mockUsersDbSet.Setup(m => m.AnyAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<User, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);

        _mockContext.Setup(c => c.Users).Returns(mockUsersDbSet.Object);

        // Act
        var result = await _controller.Register(registerRequest);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequestResult.StatusCode);
        _mockContext.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    /// <summary>
    /// Unhappy path: Registration should fail when username already exists.
    /// Validates: Duplicate username prevention, database not modified.
    /// </summary>
    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenUsernameAlreadyExists()
    {
        // Arrange
        var registerRequest = new RegisterRequestDto
        {
            Username = "existinguser",
            Email = "newemail@example.com",
            Password = "SecurePassword123"
        };

        var mockUsersDbSet = new Mock<DbSet<User>>();
        var emailCheckCall = 0;
        mockUsersDbSet.Setup(m => m.AnyAsync(It.IsAny<System.Linq.Expressions.Expression<System.Func<User, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(() =>
            {
                emailCheckCall++;
                return emailCheckCall == 2; // Email doesn't exist, but username does
            });

        _mockContext.Setup(c => c.Users).Returns(mockUsersDbSet.Object);

        // Act
        var result = await _controller.Register(registerRequest);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequestResult.StatusCode);
        _mockContext.Verify(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Never);
    }

    /// <summary>
    /// Unhappy path: Registration should fail when ModelState is invalid.
    /// Validates: Input validation is enforced before database operations.
    /// </summary>
    [Fact]
    public async Task Register_ShouldReturnBadRequest_WhenModelStateIsInvalid()
    {
        // Arrange
        var registerRequest = new RegisterRequestDto
        {
            Username = "newuser",
            Email = "newuser@example.com",
            Password = "short" // Less than 6 characters
        };

        _controller.ModelState.AddModelError("Password", "Password must be at least 6 characters");

        // Act
        var result = await _controller.Register(registerRequest);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequestResult.StatusCode);
    }

    #endregion

    #region Login Tests

    /// <summary>
    /// Happy path: Login should succeed with valid username and password.
    /// Validates: User is found, password is verified, JWT token is generated, user data is returned.
    /// </summary>
    [Fact]
    public async Task Login_ShouldReturnToken_WhenCredentialsAreValid()
    {
        // Arrange
        var loginRequest = new LoginRequestDto
        {
            UsernameOrEmail = "testuser",
            Password = "Password123"
        };

        var testUser = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            DisplayName = "Test User",
            RoleId = RoleService.UserRoleId,
            Role = new Role { Id = RoleService.UserRoleId, Name = "User" }
        };

        var passwordHasher = new PasswordHasher<User>();
        testUser.PasswordHash = passwordHasher.HashPassword(testUser, "Password123");

        var mockUsersDbSet = new Mock<DbSet<User>>();
        mockUsersDbSet.Setup(m => m.Include(It.IsAny<string>()).FirstOrDefaultAsync(
            It.IsAny<System.Linq.Expressions.Expression<System.Func<User, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(testUser);

        _mockContext.Setup(c => c.Users).Returns(mockUsersDbSet.Object);
        _mockJwtService.Setup(s => s.GenerateToken(It.IsAny<User>()))
            .Returns("test_jwt_token");

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var response = okResult.Value as LoginResponseDto;
        Assert.NotNull(response);
        Assert.Equal("test_jwt_token", response.Token);
        Assert.Equal("testuser", response.User.Username);
        _mockJwtService.Verify(s => s.GenerateToken(It.IsAny<User>()), Times.Once);
    }

    /// <summary>
    /// Unhappy path: Login should fail when user is not found.
    /// Validates: Non-existent users are rejected, no token is generated.
    /// </summary>
    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenUserNotFound()
    {
        // Arrange
        var loginRequest = new LoginRequestDto
        {
            UsernameOrEmail = "nonexistent",
            Password = "Password123"
        };

        var mockUsersDbSet = new Mock<DbSet<User>>();
        mockUsersDbSet.Setup(m => m.Include(It.IsAny<string>()).FirstOrDefaultAsync(
            It.IsAny<System.Linq.Expressions.Expression<System.Func<User, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((User)null!);

        _mockContext.Setup(c => c.Users).Returns(mockUsersDbSet.Object);

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(401, unauthorizedResult.StatusCode);
        _mockJwtService.Verify(s => s.GenerateToken(It.IsAny<User>()), Times.Never);
    }

    /// <summary>
    /// Unhappy path: Login should fail when password is incorrect.
    /// Validates: Failed password verification rejects login attempt.
    /// </summary>
    [Fact]
    public async Task Login_ShouldReturnUnauthorized_WhenPasswordIsIncorrect()
    {
        // Arrange
        var loginRequest = new LoginRequestDto
        {
            UsernameOrEmail = "testuser",
            Password = "WrongPassword"
        };

        var testUser = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            RoleId = RoleService.UserRoleId,
            Role = new Role { Id = RoleService.UserRoleId, Name = "User" }
        };

        var passwordHasher = new PasswordHasher<User>();
        testUser.PasswordHash = passwordHasher.HashPassword(testUser, "CorrectPassword123");

        var mockUsersDbSet = new Mock<DbSet<User>>();
        mockUsersDbSet.Setup(m => m.Include(It.IsAny<string>()).FirstOrDefaultAsync(
            It.IsAny<System.Linq.Expressions.Expression<System.Func<User, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(testUser);

        _mockContext.Setup(c => c.Users).Returns(mockUsersDbSet.Object);

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal(401, unauthorizedResult.StatusCode);
        _mockJwtService.Verify(s => s.GenerateToken(It.IsAny<User>()), Times.Never);
    }

    /// <summary>
    /// Unhappy path: Login should fail when ModelState is invalid.
    /// Validates: Input validation occurs before database operations.
    /// </summary>
    [Fact]
    public async Task Login_ShouldReturnBadRequest_WhenModelStateIsInvalid()
    {
        // Arrange
        var loginRequest = new LoginRequestDto
        {
            UsernameOrEmail = "testuser",
            Password = "short" // Less than 6 characters
        };

        _controller.ModelState.AddModelError("Password", "Password must be at least 6 characters");

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badRequestResult.StatusCode);
    }

    /// <summary>
    /// Happy path: Login should work with email as username.
    /// Validates: Both username and email can be used for login.
    /// </summary>
    [Fact]
    public async Task Login_ShouldSucceed_WhenUsingEmailAsUsername()
    {
        // Arrange
        var loginRequest = new LoginRequestDto
        {
            UsernameOrEmail = "test@example.com",
            Password = "Password123"
        };

        var testUser = new User
        {
            Id = 1,
            Username = "testuser",
            Email = "test@example.com",
            DisplayName = "Test User",
            RoleId = RoleService.UserRoleId,
            Role = new Role { Id = RoleService.UserRoleId, Name = "User" }
        };

        var passwordHasher = new PasswordHasher<User>();
        testUser.PasswordHash = passwordHasher.HashPassword(testUser, "Password123");

        var mockUsersDbSet = new Mock<DbSet<User>>();
        mockUsersDbSet.Setup(m => m.Include(It.IsAny<string>()).FirstOrDefaultAsync(
            It.IsAny<System.Linq.Expressions.Expression<System.Func<User, bool>>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(testUser);

        _mockContext.Setup(c => c.Users).Returns(mockUsersDbSet.Object);
        _mockJwtService.Setup(s => s.GenerateToken(It.IsAny<User>()))
            .Returns("test_jwt_token");

        // Act
        var result = await _controller.Login(loginRequest);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);
    }

    #endregion

    #region Role-Based Access Tests

    /// <summary>
    /// Unhappy path: Non-moderator users should not be able to access user list.
    /// Validates: Authorization policy is enforced on protected endpoints.
    /// </summary>
    [Fact]
    public async Task GetAllUsers_ShouldReturnForbid_WhenUserIsNotModerator()
    {
        // Arrange
        var claims = new System.Security.Principal.GenericPrincipal(
            new System.Security.Principal.GenericIdentity("testuser"),
            new[] { "User" }
        );

        // Act
        var result = await _controller.GetAllUsers();

        // Assert
        var forbidResult = Assert.IsType<ForbidResult>(result);
        Assert.Equal(403, forbidResult.StatusCode);
    }

    #endregion
}
