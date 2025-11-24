using System;
using Volo.Abp.Domain.Entities;

namespace LowBackPain.Entities;

/// <summary>
/// PatientImage Entity - 患者图像实体
/// 存储患者的 X光、MRI、照片、姿势图像等
/// </summary>
public class PatientImage : Entity<Guid>
{
    /// <summary>
    /// 关联的患者ID
    /// </summary>
    public Guid PatientId { get; set; }

    /// <summary>
    /// 图像类型 (xray, mri, photo, posture)
    /// </summary>
    public string ImageType { get; set; }

    /// <summary>
    /// 文件名
    /// </summary>
    public string FileName { get; set; }

    /// <summary>
    /// 文件存储路径
    /// </summary>
    public string FilePath { get; set; }

    /// <summary>
    /// MIME 类型 (image/jpeg, image/png, application/dicom)
    /// </summary>
    public string MimeType { get; set; }

    /// <summary>
    /// 文件大小（字节）
    /// </summary>
    public long FileSize { get; set; }

    /// <summary>
    /// 图像描述
    /// </summary>
    public string Description { get; set; }

    /// <summary>
    /// 上传时间
    /// </summary>
    public DateTime UploadedAt { get; set; }

    /// <summary>
    /// 导航属性：关联的患者
    /// </summary>
    public virtual Patient Patient { get; set; }

    // ==================== 构造函数 ====================

    protected PatientImage()
    {
        // For ORM
    }

    public PatientImage(
        Guid id,
        Guid patientId,
        string imageType,
        string fileName,
        string filePath,
        string mimeType,
        long fileSize,
        string description = null) : base(id)
    {
        PatientId = patientId;
        ImageType = imageType;
        FileName = fileName;
        FilePath = filePath;
        MimeType = mimeType;
        FileSize = fileSize;
        Description = description;
        UploadedAt = DateTime.UtcNow;
    }

    // ==================== 业务方法 ====================

    /// <summary>
    /// 更新描述
    /// </summary>
    public void UpdateDescription(string description)
    {
        Description = description;
    }
}
