using System.ComponentModel.DataAnnotations;

namespace PokeInfo.Models.Auth;

public class UpdateAccountDto
{
    [RegularExpression(@"^[a-zA-Z0-9_-]{3,50}$", ErrorMessage = "Username must be 3-50 characters and can only contain letters, numbers, underscores, and hyphens.")]
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
    public string? ConfirmPassword { get; set; }
}
