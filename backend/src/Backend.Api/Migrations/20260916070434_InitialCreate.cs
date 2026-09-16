using System;
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
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    address = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    schedule = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    lat = table.Column<double>(type: "double precision", nullable: false),
                    lng = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_transfusion_centers", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    phone = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    age = table.Column<int>(type: "integer", nullable: true),
                    is_donor = table.Column<bool>(type: "boolean", nullable: false),
                    is_admin = table.Column<bool>(type: "boolean", nullable: false),
                    blood_type = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: true),
                    last_donation_date = table.Column<DateOnly>(type: "date", nullable: true),
                    password_hash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_users", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "blood_requests",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    requester_id = table.Column<int>(type: "integer", nullable: false),
                    required_blood_type = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    city = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    urgency = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_blood_requests", x => x.id);
                    table.ForeignKey(
                        name: "fk_blood_requests_users_requester_id",
                        column: x => x.requester_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "notifications",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    type = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    message = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    is_read = table.Column<bool>(type: "boolean", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    link = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_notifications", x => x.id);
                    table.ForeignKey(
                        name: "fk_notifications_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "request_responses",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    blood_request_id = table.Column<int>(type: "integer", nullable: false),
                    donor_id = table.Column<int>(type: "integer", nullable: false),
                    status = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    responded_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_request_responses", x => x.id);
                    table.ForeignKey(
                        name: "fk_request_responses_blood_requests_blood_request_id",
                        column: x => x.blood_request_id,
                        principalTable: "blood_requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_request_responses_users_donor_id",
                        column: x => x.donor_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "transfusion_centers",
                columns: new[] { "id", "address", "city", "lat", "lng", "name", "phone", "schedule" },
                values: new object[,]
                {
                    { 1, "Str. Academiei 11, Chișinău", "Chișinău", 47.015900000000002, 28.841899999999999, "Centrul Național de Transfuzie a Sângelui", "+373 22 727 511", "Luni–Vineri, 08:00–15:00" },
                    { 2, "Str. Decebal 113, Bălți", "Bălți", 47.756100000000004, 27.9298, "Centrul Național de Transfuzie a Sângelui — filiala Bălți", "+373 231 22 555", "Luni–Vineri, 08:00–14:00" },
                    { 3, "IMSP Spitalul Raional Cahul", "Cahul", 45.907499999999999, 28.1936, "Cabinet de Transfuzie a Sângelui — Spitalul Raional Cahul", "+373 299 22 555", "Luni–Vineri, 08:00–14:00" },
                    { 4, "IMSP Spitalul Raional Soroca", "Soroca", 48.156700000000001, 28.293900000000001, "Cabinet de Transfuzie a Sângelui — Spitalul Raional Soroca \"A. Prisăcari\"", "+373 230 22 555", "Luni–Vineri, 08:00–14:00" },
                    { 5, "Str. Odesscaia 2, Comrat", "Comrat", 46.302100000000003, 28.656700000000001, "Cabinet de Transfuzie a Sângelui — Spitalul Raional Comrat \"Isaac Gurfinchel\"", "+373 298 22 555", "Luni–Vineri, 08:00–14:00" }
                });

            migrationBuilder.CreateIndex(
                name: "ix_blood_requests_requester_id",
                table: "blood_requests",
                column: "requester_id");

            migrationBuilder.CreateIndex(
                name: "ix_notifications_user_id",
                table: "notifications",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "ix_request_responses_blood_request_id_donor_id",
                table: "request_responses",
                columns: new[] { "blood_request_id", "donor_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_request_responses_donor_id",
                table: "request_responses",
                column: "donor_id");

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "notifications");

            migrationBuilder.DropTable(
                name: "request_responses");

            migrationBuilder.DropTable(
                name: "transfusion_centers");

            migrationBuilder.DropTable(
                name: "blood_requests");

            migrationBuilder.DropTable(
                name: "users");
        }
    }
}
