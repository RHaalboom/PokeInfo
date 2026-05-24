namespace PokeInfo.Models.Auth;

public class UpdateAccountDto
{
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? CurrentPassword { get; set; }
    public string? NewPassword { get; set; }
    public string? ConfirmPassword { get; set; }
}
