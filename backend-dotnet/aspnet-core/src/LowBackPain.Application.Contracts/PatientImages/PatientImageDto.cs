using System;

namespace LowBackPain.PatientImages;

/// <summary>
/// Patient Image DTO
/// 患者图像数据传输对象
/// </summary>
public class PatientImageDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string ImageType { get; set; }
    public string FileName { get; set; }
    public string FilePath { get; set; }
    public string MimeType { get; set; }
    public long FileSize { get; set; }
    public string Description { get; set; }
    public DateTime UploadedAt { get; set; }

    /// <summary>
    /// URL to access the image (generated at runtime)
    /// </summary>
    public string Url { get; set; }
}
