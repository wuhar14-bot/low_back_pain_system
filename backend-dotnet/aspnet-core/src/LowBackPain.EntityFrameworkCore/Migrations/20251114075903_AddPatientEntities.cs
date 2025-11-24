using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LowBackPain.Migrations
{
    /// <inheritdoc />
    public partial class AddPatientEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppPatients",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    StudyId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Age = table.Column<int>(type: "integer", nullable: true),
                    Gender = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    Phone = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    OnsetDate = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    ChiefComplaint = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    WorkspaceId = table.Column<Guid>(type: "uuid", nullable: false),
                    WorkspaceName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    DoctorId = table.Column<Guid>(type: "uuid", nullable: false),
                    DoctorName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    MedicalHistoryJson = table.Column<string>(type: "jsonb", nullable: false),
                    PainAreasJson = table.Column<string>(type: "jsonb", nullable: false),
                    SubjectiveExamJson = table.Column<string>(type: "jsonb", nullable: false),
                    ObjectiveExamJson = table.Column<string>(type: "jsonb", nullable: false),
                    FunctionalScoresJson = table.Column<string>(type: "jsonb", nullable: false),
                    AiPostureAnalysisJson = table.Column<string>(type: "jsonb", nullable: false),
                    InterventionJson = table.Column<string>(type: "jsonb", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: false),
                    ExtraProperties = table.Column<string>(type: "text", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: false),
                    CreatorId = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true),
                    LastModifierId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    DeleterId = table.Column<Guid>(type: "uuid", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "timestamp without time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppPatients", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppPatientImages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PatientId = table.Column<Guid>(type: "uuid", nullable: false),
                    ImageType = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FilePath = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    MimeType = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppPatientImages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppPatientImages_AppPatients_PatientId",
                        column: x => x.PatientId,
                        principalTable: "AppPatients",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppPatientImages_PatientId",
                table: "AppPatientImages",
                column: "PatientId");

            migrationBuilder.CreateIndex(
                name: "IX_AppPatientImages_UploadedAt",
                table: "AppPatientImages",
                column: "UploadedAt");

            migrationBuilder.CreateIndex(
                name: "IX_AppPatients_CreationTime",
                table: "AppPatients",
                column: "CreationTime");

            migrationBuilder.CreateIndex(
                name: "IX_AppPatients_DoctorId",
                table: "AppPatients",
                column: "DoctorId");

            migrationBuilder.CreateIndex(
                name: "IX_AppPatients_StudyId",
                table: "AppPatients",
                column: "StudyId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppPatients_WorkspaceId",
                table: "AppPatients",
                column: "WorkspaceId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppPatientImages");

            migrationBuilder.DropTable(
                name: "AppPatients");
        }
    }
}
