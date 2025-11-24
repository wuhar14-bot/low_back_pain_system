using System;
using Volo.Abp.Application.Dtos;

namespace LowBackPainSystem.Patients
{
    /// <summary>
    /// 获取患者列表查询参数
    /// Get Patients List Input Parameters
    /// </summary>
    public class GetPatientsInput : PagedAndSortedResultRequestDto
    {
        /// <summary>
        /// 工作室ID过滤
        /// Filter by workspace ID
        /// </summary>
        public Guid? WorkspaceId { get; set; }

        /// <summary>
        /// 医生ID过滤
        /// Filter by doctor ID
        /// </summary>
        public Guid? DoctorId { get; set; }

        /// <summary>
        /// 研究ID过滤
        /// Filter by study ID
        /// </summary>
        public string StudyId { get; set; }

        /// <summary>
        /// 姓名搜索
        /// Search by name
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 性别过滤
        /// Filter by gender
        /// </summary>
        public string Gender { get; set; }

        /// <summary>
        /// 最小年龄
        /// Minimum age
        /// </summary>
        public int? MinAge { get; set; }

        /// <summary>
        /// 最大年龄
        /// Maximum age
        /// </summary>
        public int? MaxAge { get; set; }

        /// <summary>
        /// 是否只显示有AI分析的患者
        /// Show only patients with AI analysis
        /// </summary>
        public bool? HasAiAnalysis { get; set; }
    }
}
