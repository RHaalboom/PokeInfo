namespace PokeInfo.Models.Auth;

public class UpdateProfileDto
{
    public string? DisplayName { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? ThreedsFC { get; set; }
    public string? SwitchFC { get; set; }
    public bool? ShowRankings { get; set; }
}
