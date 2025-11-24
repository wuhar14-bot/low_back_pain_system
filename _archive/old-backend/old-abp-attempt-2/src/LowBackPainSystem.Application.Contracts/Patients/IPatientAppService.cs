using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace LowBackPainSystem.Patients
{
    /// <summary>
    /// 患者应用服务接口
    /// Patient Application Service Interface
    /// </summary>
    public interface IPatientAppService : IApplicationService
    {
        /// <summary>
        /// 获取患者详情
        /// Get patient by ID
        /// </summary>
        Task<PatientDto> GetAsync(Guid id);

        /// <summary>
        /// 获取患者列表 (分页)
        /// Get patient list (paged)
        /// </summary>
        Task<PagedResultDto<PatientDto>> GetListAsync(GetPatientsInput input);

        /// <summary>
        /// 创建新患者
        /// Create new patient
        /// </summary>
        Task<PatientDto> CreateAsync(CreatePatientDto input);

        /// <summary>
        /// 更新患者信息
        /// Update patient
        /// </summary>
        Task<PatientDto> UpdateAsync(Guid id, UpdatePatientDto input);

        /// <summary>
        /// 删除患者
        /// Delete patient
        /// </summary>
        Task DeleteAsync(Guid id);

        /// <summary>
        /// 更新患者的AI姿态分析结果
        /// Update patient's AI posture analysis
        /// </summary>
        Task<PatientDto> UpdatePoseAnalysisAsync(Guid id, string poseAnalysisJson);

        /// <summary>
        /// 获取工作室的所有患者
        /// Get all patients by workspace
        /// </summary>
        Task<ListResultDto<PatientDto>> GetByWorkspaceAsync(Guid workspaceId);

        /// <summary>
        /// 获取医生的所有患者
        /// Get all patients by doctor
        /// </summary>
        Task<ListResultDto<PatientDto>> GetByDoctorAsync(Guid doctorId);
    }
}
