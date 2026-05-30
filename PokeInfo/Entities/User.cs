using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PokeInfo.Entities;

public class User
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? DisplayName { get; set; }

    public string? ProfilePictureUrl { get; set; }

    [StringLength(12, MinimumLength = 12)]
    public string? ThreedsFC { get; set; }

    [StringLength(12, MinimumLength = 12)]
    public string? SwitchFC { get; set; }

    public int RoleId { get; set; } = 1;

    public Role Role { get; set; } = null!;

    public List<Collection> Collections { get; set; } = new();

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public DateTime CreatedAt { get; set; }
}
