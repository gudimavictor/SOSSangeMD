using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Backend.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "transfusion_centers",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nume = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    oras = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    adresa = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    telefon = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    program = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    lat = table.Column<double>(type: "double precision", nullable: false),
                    lng = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_transfusion_centers", x => x.id);
                });

            migrationBuilder.InsertData(
                table: "transfusion_centers",
                columns: new[] { "id", "adresa", "lat", "lng", "nume", "oras", "program", "telefon" },
                values: new object[,]
                {
                    { 1, "Str. Academiei 11, Chișinău", 47.015900000000002, 28.841899999999999, "Centrul Național de Transfuzie a Sângelui", "Chișinău", "Luni–Vineri, 08:00–15:00", "+373 22 727 511" },
                    { 2, "Str. Decebal 113, Bălți", 47.756100000000004, 27.9298, "Centrul Național de Transfuzie a Sângelui — filiala Bălți", "Bălți", "Luni–Vineri, 08:00–14:00", "+373 231 22 555" },
                    { 3, "IMSP Spitalul Raional Cahul", 45.907499999999999, 28.1936, "Cabinet de Transfuzie a Sângelui — Spitalul Raional Cahul", "Cahul", "Luni–Vineri, 08:00–14:00", "+373 299 22 555" },
                    { 4, "IMSP Spitalul Raional Soroca", 48.156700000000001, 28.293900000000001, "Cabinet de Transfuzie a Sângelui — Spitalul Raional Soroca \"A. Prisăcari\"", "Soroca", "Luni–Vineri, 08:00–14:00", "+373 230 22 555" },
                    { 5, "Str. Odesscaia 2, Comrat", 46.302100000000003, 28.656700000000001, "Cabinet de Transfuzie a Sângelui — Spitalul Raional Comrat \"Isaac Gurfinchel\"", "Comrat", "Luni–Vineri, 08:00–14:00", "+373 298 22 555" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "transfusion_centers");
        }
    }
}
