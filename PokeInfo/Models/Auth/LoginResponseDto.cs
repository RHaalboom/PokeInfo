namespace PokeInfo.Models.Auth;

public class LoginResponseDto
{
    public string Message { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public UserResponseDto User { get; set; } = null!;
}
