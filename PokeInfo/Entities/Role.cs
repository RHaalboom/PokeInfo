using System.ComponentModel.DataAnnotations;

namespace PokeInfo.Entities;

public class Role
{
    public int Id { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string Description { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = [];
}
