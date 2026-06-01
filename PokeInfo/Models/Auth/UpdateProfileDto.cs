using System.ComponentModel.DataAnnotations;

namespace PokeInfo.Models.Auth;

public class UpdateProfileDto
{
    [RegularExpression(@"^[a-zA-Z0-9_-]{3,50}$", ErrorMessage = "Display name must be 3-50 characters and can only contain letters, numbers, underscores, and hyphens.")]
    public string? DisplayName { get; set; }
    public string? ProfilePictureUrl { get; set; }
    public string? ThreedsFC { get; set; }
    public string? SwitchFC { get; set; }
    public bool? ShowRankings { get; set; }
}
