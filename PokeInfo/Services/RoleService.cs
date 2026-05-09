namespace PokeInfo.Services;

/// <summary>
/// Service to help check user roles and permissions
/// </summary>
public class RoleService
{
    public const int UserRoleId = 1;
    public const int RankedUserRoleId = 2;
    public const int ModeratorRoleId = 3;

    public const string UserRoleName = "User";
    public const string RankedUserRoleName = "RankedUser";
    public const string ModeratorRoleName = "Moderator";

    /// <summary>
    /// Checks if a user can see rankings
    /// </summary>
    public static bool CanSeeRankings(int roleId)
    {
        return roleId == RankedUserRoleId || roleId == ModeratorRoleId;
    }

    /// <summary>
    /// Checks if a user has moderator access
    /// </summary>
    public static bool IsModeratorOrAbove(int roleId)
    {
        return roleId == ModeratorRoleId;
    }

    /// <summary>
    /// Gets the role name from role ID
    /// </summary>
    public static string GetRoleName(int roleId)
    {
        return roleId switch
        {
            UserRoleId => UserRoleName,
            RankedUserRoleId => RankedUserRoleName,
            ModeratorRoleId => ModeratorRoleName,
            _ => "Unknown"
        };
    }
}
