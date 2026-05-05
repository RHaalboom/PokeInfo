using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
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

    public AuthController(PokeInfoDbContext context)
    {
        _context = context;
        _passwordHasher = new PasswordHasher<User>();
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

    [HttpGet("users")]
    public async Task<IActionResult> GetAllUsers()
    {
        // TODO: Add JWT token validation to check if user is moderator
        // For now, this endpoint is open. Add authorization middleware when implementing authentication
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
    public async Task<IActionResult> UpdateUserRole(int id, int roleId)
    {
        // TODO: Add JWT token validation to check if user is moderator
        // For now, this endpoint is open. Add authorization middleware when implementing authentication
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
}

