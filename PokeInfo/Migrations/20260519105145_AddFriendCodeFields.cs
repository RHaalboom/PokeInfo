using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokeInfo.Migrations
{
    /// <inheritdoc />
    public partial class AddFriendCodeFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SwitchFC",
                table: "Users",
                type: "varchar(12)",
                maxLength: 12,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ThreedsFC",
                table: "Users",
                type: "varchar(12)",
                maxLength: 12,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SwitchFC",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "ThreedsFC",
                table: "Users");
        }
    }
}
