using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using PokeInfo.Data;
using PokeInfo.Entities;
using PokeInfo.Models.Auth;
using PokeInfo.Services;

namespace PokeInfo.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly PokeInfoDbContext _context;
    private readonly PasswordHasher<User> _passwordHasher;
    private readonly JwtService _jwtService;

    public AuthController(PokeInfoDbContext context, JwtService jwtService)
    {
        _context = context;
        _passwordHasher = new PasswordHasher<User>();
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email);
        if (emailExists)
        {
            return BadRequest(new { message = "This email address is already in use." });
        }

        var usernameExists = await _context.Users.AnyAsync(u => u.Username == request.Username);
        if (usernameExists)
        {
            return BadRequest(new { message = "This username is already in use." });
        }

        var user = new User
        {
            Username = request.Username,
            Email = request.Email,
            RoleId = RoleService.UserRoleId
        };

        user.PasswordHash = _passwordHasher.HashPassword(user, request.Password);

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Account successfully created." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await _context.Users
            .Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == request.UsernameOrEmail || u.Username == request.UsernameOrEmail);

        if (user == null)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (result == PasswordVerificationResult.Failed)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var token = _jwtService.GenerateToken(user);
        var response = new LoginResponseDto
        {
            Message = "Login successful.",
            Token = token,
            User = new UserResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                DisplayName = user.DisplayName,
                ProfilePictureUrl = user.ProfilePictureUrl,
                ThreedsFC = user.ThreedsFC,
                SwitchFC = user.SwitchFC,
                ShowRankings = user.RoleId == RoleService.RankedUserRoleId,
                RoleName = user.Role.Name
            }
        };

        return Ok(response);
    }

    [HttpGet("users")]
    [Authorize]
    public async Task<IActionResult> GetAllUsers()
    {
        var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        if (roleClaim?.ToLower() != "moderator")
        {
            return Forbid();
        }

        var users = await _context.Users
            .Include(u => u.Role)
            .Select(u => new UserResponseDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                RoleName = u.Role.Name
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpPut("users/{id}/role/{roleId}")]
    [Authorize]
    public async Task<IActionResult> UpdateUserRole(int id, int roleId)
    {
        var roleClaim = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        if (roleClaim?.ToLower() != "moderator")
        {
            return Forbid();
        }

        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        var role = await _context.Roles.FindAsync(roleId);
        if (role == null)
        {
            return NotFound(new { message = "Role not found." });
        }

        user.RoleId = roleId;
        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "User role successfully updated." });
    }

    [HttpGet("roles")]
    public async Task<IActionResult> GetAllRoles()
    {
        var roles = await _context.Roles.ToListAsync();
        return Ok(roles);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto request)
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim?.Value, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        if (!string.IsNullOrWhiteSpace(request.DisplayName) && request.DisplayName != user.DisplayName)
        {
            var displayNameTaken = await _context.Users.AnyAsync(u => u.DisplayName == request.DisplayName);
            if (displayNameTaken)
            {
                return BadRequest(new { message = "This display name is already in use." });
            }
            user.DisplayName = request.DisplayName;
        }

        if (!string.IsNullOrWhiteSpace(request.ProfilePictureUrl))
        {
            user.ProfilePictureUrl = request.ProfilePictureUrl;
        }

        if (!string.IsNullOrWhiteSpace(request.ThreedsFC))
        {
            if (request.ThreedsFC.Length != 12)
            {
                return BadRequest(new { message = "3DS Friend Code must be exactly 12 digits." });
            }
            user.ThreedsFC = request.ThreedsFC;
        }

        if (!string.IsNullOrWhiteSpace(request.SwitchFC))
        {
            if (request.SwitchFC.Length != 12)
            {
                return BadRequest(new { message = "Switch Friend Code must be exactly 12 digits." });
            }
            user.SwitchFC = request.SwitchFC;
        }

        if (request.ShowRankings.HasValue)
        {
            user.RoleId = request.ShowRankings.Value ? RoleService.RankedUserRoleId : RoleService.UserRoleId;
        }

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Id == userId);

        var response = new UserResponseDto
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            DisplayName = user.DisplayName,
            ProfilePictureUrl = user.ProfilePictureUrl,
            ThreedsFC = user.ThreedsFC,
            SwitchFC = user.SwitchFC,
            ShowRankings = user.RoleId == RoleService.RankedUserRoleId,
            RoleName = user.Role?.Name ?? "User"
        };

        return Ok(response);
    }

    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (request.NewPassword != request.ConfirmPassword)
        {
            return BadRequest(new { message = "New passwords do not match." });
        }

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim?.Value, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
        if (verifyResult == PasswordVerificationResult.Failed)
        {
            return BadRequest(new { message = "Current password is incorrect." });
        }

        user.PasswordHash = _passwordHasher.HashPassword(user, request.NewPassword);
        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Password successfully changed." });
    }

    [HttpPut("update-account")]
    [Authorize]
    public async Task<IActionResult> UpdateAccount(UpdateAccountDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdClaim?.Value, out var userId))
        {
            return Unauthorized();
        }

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        // Verify current password if updating sensitive fields
        if (!string.IsNullOrWhiteSpace(request.Username) || !string.IsNullOrWhiteSpace(request.Email))
        {
            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            {
                return BadRequest(new { message = "Current password is required to change username or email." });
            }

            var verifyResult = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.CurrentPassword);
            if (verifyResult == PasswordVerificationResult.Failed)
            {
                return BadRequest(new { message = "Current password is incorrect." });
            }
        }

        // Check if new username is already in use
        if (!string.IsNullOrWhiteSpace(request.Username) && request.Username != user.Username)
        {
            var usernameTaken = await _context.Users.AnyAsync(u => u.Username == request.Username);
            if (usernameTaken)
            {
                return BadRequest(new { message = "This username is already in use." });
            }
            user.Username = request.Username;
        }

        // Check if new email is already in use
        if (!string.IsNullOrWhiteSpace(request.Email) && request.Email != user.Email)
        {
            var emailTaken = await _context.Users.AnyAsync(u => u.Email == request.Email);
            if (emailTaken)
            {
                return BadRequest(new { message = "This email address is already in use." });
            }
            user.Email = request.Email;
        }

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Account updated successfully." });
    }
}
