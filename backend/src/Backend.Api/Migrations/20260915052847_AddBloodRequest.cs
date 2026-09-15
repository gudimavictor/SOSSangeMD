using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddBloodRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "blood_requests",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    solicitant_id = table.Column<int>(type: "integer", nullable: false),
                    grupa_necesara = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    oras = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    urgenta = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    descriere = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    data_creare = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_blood_requests", x => x.id);
                    table.ForeignKey(
                        name: "fk_blood_requests_users_solicitant_id",
                        column: x => x.solicitant_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_blood_requests_solicitant_id",
                table: "blood_requests",
                column: "solicitant_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "blood_requests");
        }
    }
}
