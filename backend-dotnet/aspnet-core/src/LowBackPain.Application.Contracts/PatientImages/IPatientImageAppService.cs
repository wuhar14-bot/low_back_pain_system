using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Volo.Abp.Application.Services;
using Volo.Abp.Content;

namespace LowBackPain.PatientImages;

/// <summary>
/// Patient Image Application Service Interface
/// 患者图像应用服务接口
/// </summary>
public interface IPatientImageAppService : IApplicationService
{
    /// <summary>
    /// Upload an image for a patient
    /// 上传患者图像
    /// </summary>
    Task<PatientImageDto> UploadAsync(Guid patientId, IRemoteStreamContent file, string imageType, string description = null);

    /// <summary>
    /// Get all images for a patient
    /// 获取患者的所有图像
    /// </summary>
    Task<List<PatientImageDto>> GetListByPatientAsync(Guid patientId);

    /// <summary>
    /// Get a single image by ID
    /// 根据ID获取图像
    /// </summary>
    Task<PatientImageDto> GetAsync(Guid id);

    /// <summary>
    /// Download image file
    /// 下载图像文件
    /// </summary>
    Task<IRemoteStreamContent> DownloadAsync(Guid id);

    /// <summary>
    /// Delete an image
    /// 删除图像
    /// </summary>
    Task DeleteAsync(Guid id);

    /// <summary>
    /// Update image description
    /// 更新图像描述
    /// </summary>
    Task<PatientImageDto> UpdateDescriptionAsync(Guid id, string description);
}
