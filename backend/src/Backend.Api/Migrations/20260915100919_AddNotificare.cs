using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNotificare : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "notificari",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    tip = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    titlu = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    mesaj = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    citita = table.Column<bool>(type: "boolean", nullable: false),
                    data = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    link = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notificari", x => x.id);
                    table.ForeignKey(
                        name: "fk_notificari_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_notificari_user_id",
                table: "notificari",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notificari");
        }
    }
}
