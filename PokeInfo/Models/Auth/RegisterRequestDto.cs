using System.ComponentModel.DataAnnotations;

namespace PokeInfo.Models.Auth;

public class RegisterRequestDto
{
	[Required]
	[MaxLength(50)]
	[RegularExpression(@"^[a-zA-Z0-9_-]{3,50}$", ErrorMessage = "Username must be 3-50 characters and can only contain letters, numbers, underscores, and hyphens.")]
	public string Username { get; set; } = string.Empty;

	[Required]
	[EmailAddress]
	[MaxLength(100)]
	public string Email { get; set; } = string.Empty;

	[Required]
	[MinLength(6)]
	public string Password { get; set; } = string.Empty;
}