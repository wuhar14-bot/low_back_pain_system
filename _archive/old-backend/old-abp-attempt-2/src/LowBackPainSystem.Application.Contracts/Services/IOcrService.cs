using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace LowBackPainSystem.Services
{
    /// <summary>
    /// OCR服务接口
    /// OCR Service Interface
    /// </summary>
    public interface IOcrService : IApplicationService
    {
        /// <summary>
        /// 处理单张图片的OCR
        /// Process OCR for single image
        /// </summary>
        /// <param name="base64Image">Base64编码的图片</param>
        Task<OcrResultDto> ProcessImageAsync(string base64Image);

        /// <summary>
        /// 检查OCR服务健康状态
        /// Check OCR service health
        /// </summary>
        Task<bool> CheckHealthAsync();
    }
}
