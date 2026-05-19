using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokeInfo.Migrations
{
    /// <inheritdoc />
    public partial class RemoveShowRankingsColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShowRankings",
                table: "Users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ShowRankings",
                table: "Users",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);
        }
    }
}
