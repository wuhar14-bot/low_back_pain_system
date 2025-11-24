using System;
using Volo.Abp.Application.Dtos;

namespace LowBackPain.Patients;

/// <summary>
/// Patient DTO - 患者数据传输对象
/// </summary>
public class PatientDto : FullAuditedEntityDto<Guid>
{
    // 基本信息
    public string StudyId { get; set; }
    public string Name { get; set; }
    public int? Age { get; set; }
    public string Gender { get; set; }
    public string Phone { get; set; }
    public DateTime? OnsetDate { get; set; }
    public string ChiefComplaint { get; set; }

    // 外部系统关联
    public Guid WorkspaceId { get; set; }
    public string WorkspaceName { get; set; }
    public Guid DoctorId { get; set; }
    public string DoctorName { get; set; }

    // 临床数据 JSON (as strings)
    public string MedicalHistoryJson { get; set; }
    public string PainAreasJson { get; set; }
    public string SubjectiveExamJson { get; set; }
    public string ObjectiveExamJson { get; set; }
    public string FunctionalScoresJson { get; set; }
    public string AiPostureAnalysisJson { get; set; }
    public string InterventionJson { get; set; }

    // 其他
    public string Remarks { get; set; }
}
