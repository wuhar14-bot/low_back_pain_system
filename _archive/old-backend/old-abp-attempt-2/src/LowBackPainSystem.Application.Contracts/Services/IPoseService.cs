using System.Threading.Tasks;
using Volo.Abp.Application.Services;

namespace LowBackPainSystem.Services
{
    /// <summary>
    /// 姿态分析服务接口
    /// Pose Analysis Service Interface
    /// </summary>
    public interface IPoseService : IApplicationService
    {
        /// <summary>
        /// 分析静态姿态图片
        /// Analyze static pose images
        /// </summary>
        /// <param name="standingImageBase64">站立姿态图片 (Base64)</param>
        /// <param name="flexionImageBase64">屈曲姿态图片 (Base64)</param>
        Task<PoseAnalysisResultDto> AnalyzeStaticPoseAsync(
            string standingImageBase64,
            string flexionImageBase64
        );

        /// <summary>
        /// 检查姿态分析服务健康状态
        /// Check pose service health
        /// </summary>
        Task<bool> CheckHealthAsync();
    }
}
