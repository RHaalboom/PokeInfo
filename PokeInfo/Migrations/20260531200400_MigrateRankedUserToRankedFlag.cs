using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokeInfo.Migrations
{
    /// <inheritdoc />
    public partial class MigrateRankedUserToRankedFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Disable FK checks during migration
            migrationBuilder.Sql("SET FOREIGN_KEY_CHECKS = 0");

            // Use temporary role IDs to avoid FK constraint violations during migration
            // Step 1: Assign all roles to temporary IDs
            migrationBuilder.Sql(
                @"UPDATE Roles 
                  SET Id = 101 
                  WHERE Id = 1 AND Name = 'User'");

            migrationBuilder.Sql(
                @"UPDATE Roles 
                  SET Id = 102 
                  WHERE Id = 2 AND Name = 'RankedUser'");

            migrationBuilder.Sql(
                @"UPDATE Roles 
                  SET Id = 103 
                  WHERE Id = 3 AND Name = 'Moderator'");

            migrationBuilder.Sql(
                @"UPDATE Roles 
                  SET Id = 104 
                  WHERE Id = 4 AND Name = 'Admin'");

            // Step 2: Update all Users to temporary role IDs
            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 101 
                  WHERE RoleId = 1");

            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 102 
                  WHERE RoleId = 2");

            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 103 
                  WHERE RoleId = 3");

            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 104 
                  WHERE RoleId = 4");

            // Step 3: Now migrate RankedUser (102) to User (101) with Ranked=1, and update other roles
            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 101, Ranked = 1 
                  WHERE RoleId = 102");

            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 102 
                  WHERE RoleId = 103");

            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 103 
                  WHERE RoleId = 104");

            // Step 4: Update role IDs to final values
            migrationBuilder.Sql(
                @"UPDATE Roles 
                  SET Id = 1 
                  WHERE Id = 101 AND Name = 'User'");

            migrationBuilder.Sql(
                @"UPDATE Roles 
                  SET Id = 2 
                  WHERE Id = 103 AND Name = 'Moderator'");

            migrationBuilder.Sql(
                @"UPDATE Roles 
                  SET Id = 3 
                  WHERE Id = 104 AND Name = 'Admin'");

            // Step 5: Delete RankedUser role
            migrationBuilder.Sql(
                @"DELETE FROM Roles 
                  WHERE Id = 102 AND Name = 'RankedUser'");

            // Step 6: Update Users to final role IDs
            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 1 
                  WHERE RoleId = 101");

            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 2 
                  WHERE RoleId = 102");

            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 3 
                  WHERE RoleId = 103");

            // Re-enable FK checks
            migrationBuilder.Sql("SET FOREIGN_KEY_CHECKS = 1");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Disable FK checks during downgrade
            migrationBuilder.Sql("SET FOREIGN_KEY_CHECKS = 0");

            // Reverse the migration
            // Use temporary IDs again
            migrationBuilder.Sql(
                @"UPDATE Roles 
                  SET Id = 101 
                  WHERE Id = 1 AND Name = 'User'");

            migrationBuilder.Sql(
                @"UPDATE Roles 
                  SET Id = 103 
                  WHERE Id = 2 AND Name = 'Moderator'");

            migrationBuilder.Sql(
                @"UPDATE Roles 
                  SET Id = 104 
                  WHERE Id = 3 AND Name = 'Admin'");

            // Re-insert RankedUser role
            migrationBuilder.Sql(
                @"INSERT INTO Roles (Id, Name, Description) 
                  VALUES (102, 'RankedUser', 'Ranked User Role')");

            // Update Users to temporary IDs
            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 101 
                  WHERE RoleId = 1");

            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 103 
                  WHERE RoleId = 2");

            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 104 
                  WHERE RoleId = 3");

            // Migrate User with Ranked=1 back to RankedUser
            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 102, Ranked = NULL 
                  WHERE RoleId = 101 AND Ranked = 1");

            // Update Users to old role IDs
            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 1 
                  WHERE RoleId = 101");

            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 2 
                  WHERE RoleId = 102");

            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 3 
                  WHERE RoleId = 103");

            migrationBuilder.Sql(
                @"UPDATE Users 
                  SET RoleId = 4 
                  WHERE RoleId = 104");

            // Update Roles back to old IDs
            migrationBuilder.Sql(
                @"UPDATE Roles 
                  SET Id = 1 
                  WHERE Id = 101 AND Name = 'User'");

            migrationBuilder.Sql(
                @"UPDATE Roles 
                  SET Id = 3 
                  WHERE Id = 103 AND Name = 'Moderator'");

            migrationBuilder.Sql(
                @"UPDATE Roles 
                  SET Id = 4 
                  WHERE Id = 104 AND Name = 'Admin'");

            // Re-enable FK checks
            migrationBuilder.Sql("SET FOREIGN_KEY_CHECKS = 1");
        }
    }
}
