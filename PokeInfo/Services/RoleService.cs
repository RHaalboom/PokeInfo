namespace PokeInfo.Services;

/// <summary>
/// Service to help check user roles and permissions
/// </summary>
public class RoleService
{
    public const int UserRoleId = 1;
    public const int ModeratorRoleId = 2;
    public const int AdminRoleId = 3;

    public const string UserRoleName = "User";
    public const string ModeratorRoleName = "Moderator";
    public const string AdminRoleName = "Admin";

    /// <summary>
    /// Checks if a user can see rankings
    /// </summary>
    public static bool CanSeeRankings(int roleId, int? ranked)
    {
        return ranked == 1 || roleId == ModeratorRoleId || roleId == AdminRoleId;
    }

    /// <summary>
    /// Checks if a user has moderator access
    /// </summary>
    public static bool IsModeratorOrAbove(int roleId)
    {
        return roleId == ModeratorRoleId || roleId == AdminRoleId;
    }

    /// <summary>
    /// Gets the role name from role ID
    /// </summary>
    public static string GetRoleName(int roleId)
    {
        return roleId switch
        {
            UserRoleId => UserRoleName,
            ModeratorRoleId => ModeratorRoleName,
            AdminRoleId => AdminRoleName,
            _ => "Unknown"
        };
    }
}
