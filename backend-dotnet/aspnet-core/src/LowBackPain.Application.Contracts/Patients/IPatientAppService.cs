using System;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace LowBackPain.Patients;

/// <summary>
/// Patient Application Service Interface
/// 提供患者 CRUD 操作的应用服务接口
/// </summary>
public interface IPatientAppService : ICrudAppService<
    PatientDto,
    Guid,
    PagedAndSortedResultRequestDto,
    CreatePatientDto,
    UpdatePatientDto>
{
    /// <summary>
    /// 根据 WorkspaceId 获取患者列表（分页）
    /// </summary>
    Task<PagedResultDto<PatientDto>> GetListByWorkspaceAsync(
        Guid workspaceId,
        PagedAndSortedResultRequestDto input);

    /// <summary>
    /// 根据 StudyId 获取患者
    /// </summary>
    Task<PatientDto> GetByStudyIdAsync(string studyId);

    /// <summary>
    /// 检查 StudyId 是否已存在
    /// </summary>
    Task<bool> IsStudyIdExistsAsync(string studyId);
}
