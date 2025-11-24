using System;
using Volo.Abp.Application.Dtos;

namespace LowBackPainSystem.Patients
{
    /// <summary>
    /// 患者数据传输对象
    /// Patient Data Transfer Object
    /// </summary>
    public class PatientDto : FullAuditedEntityDto<Guid>
    {
        public string StudyId { get; set; }
        public Guid WorkspaceId { get; set; }
        public Guid DoctorId { get; set; }

        // 患者信息
        public string Name { get; set; }
        public string Gender { get; set; }
        public int? Age { get; set; }
        public string Phone { get; set; }

        // 医疗信息
        public DateTime? OnsetDate { get; set; }
        public string ChiefComplaint { get; set; }
        public string MedicalHistory { get; set; }
        public string PainAreasJson { get; set; }

        // 临床检查
        public string SubjectiveExam { get; set; }
        public string ObjectiveExam { get; set; }
        public string FunctionalScoresJson { get; set; }
        public string Intervention { get; set; }

        // AI分析
        public string AiPostureAnalysisJson { get; set; }

        // 附加信息
        public string Remarks { get; set; }
        public string DataJson { get; set; }
    }
}
