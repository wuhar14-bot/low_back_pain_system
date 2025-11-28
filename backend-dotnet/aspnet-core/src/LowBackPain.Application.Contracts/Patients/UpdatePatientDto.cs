using System;
using System.ComponentModel.DataAnnotations;

namespace LowBackPain.Patients;

/// <summary>
/// Update Patient DTO - 更新患者数据传输对象
/// </summary>
public class UpdatePatientDto
{
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
