using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokeInfo.Migrations
{
    /// <inheritdoc />
    public partial class AddBannedToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Banned",
                table: "Users",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Banned",
                table: "Users");
        }
    }
}
