using System.ComponentModel.DataAnnotations;

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

    public int RoleId { get; set; } = 1;

    public Role Role { get; set; } = null!;

    public List<Collection> Collections { get; set; } = new();
}