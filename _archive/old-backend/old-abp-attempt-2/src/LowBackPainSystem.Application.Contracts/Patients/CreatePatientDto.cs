using System;
using System.ComponentModel.DataAnnotations;

namespace LowBackPainSystem.Patients
{
    /// <summary>
    /// 创建患者DTO
    /// Create Patient DTO
    /// </summary>
    public class CreatePatientDto
    {
        public string StudyId { get; set; }

        [Required]
        public Guid WorkspaceId { get; set; }

        [Required]
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

        // 附加信息
        public string Remarks { get; set; }
        public string DataJson { get; set; }
    }
}
