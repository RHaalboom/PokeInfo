using System.ComponentModel.DataAnnotations;

namespace PokeInfo.Models.Auth;

public class RegisterRequestDto
{
	[Required]
	[MaxLength(50)]
	public string Username { get; set; } = string.Empty;

	[Required]
	[EmailAddress]
	[MaxLength(100)]
	public string Email { get; set; } = string.Empty;

	[Required]
	[MinLength(6)]
	public string Password { get; set; } = string.Empty;
}