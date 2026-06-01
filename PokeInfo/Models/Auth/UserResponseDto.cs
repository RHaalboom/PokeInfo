namespace PokeInfo.Models.Auth;

public class UserResponseDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? ThreedsFC { get; set; }
    public string? SwitchFC { get; set; }
    public bool ShowRankings { get; set; }
    public string RoleName { get; set; } = string.Empty;
    public int RoleId { get; set; }
    public int? Ranked { get; set; }
    public DateTime CreatedAt { get; set; }
    public int? Banned { get; set; }
}
