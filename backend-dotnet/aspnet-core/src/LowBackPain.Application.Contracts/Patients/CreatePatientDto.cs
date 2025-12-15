using System;
using System.ComponentModel.DataAnnotations;

namespace LowBackPain.Patients;

/// <summary>
/// Create Patient DTO - 创建患者数据传输对象
/// </summary>
public class CreatePatientDto
{
    [Required]
    [StringLength(50)]
    public string StudyId { get; set; }

    [StringLength(200)]
    public string? Name { get; set; }

    public int? Age { get; set; }

    [StringLength(10)]
    public string? Gender { get; set; }

    [StringLength(50)]
    public string? Phone { get; set; }

    public DateTime? OnsetDate { get; set; }

    [StringLength(500)]
    public string? ChiefComplaint { get; set; }

    // 外部系统关联 (由外部系统传入，可选)
    public Guid? WorkspaceId { get; set; }

    [StringLength(200)]
    public string? WorkspaceName { get; set; }

    public Guid? DoctorId { get; set; }

    [StringLength(200)]
    public string? DoctorName { get; set; }

    // 临床数据 JSON (可选)
    public string? MedicalHistoryJson { get; set; }
    public string? PainAreasJson { get; set; }
    public string? SubjectiveExamJson { get; set; }
    public string? ObjectiveExamJson { get; set; }
    public string? FunctionalScoresJson { get; set; }
    public string? AiPostureAnalysisJson { get; set; }
    public string? InterventionJson { get; set; }

    public string? Remarks { get; set; }
}
