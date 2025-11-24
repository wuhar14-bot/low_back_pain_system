using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Volo.Abp.Application.Services;

namespace LowBackPainSystem.Services
{
    /// <summary>
    /// Python姿态分析服务集成实现
    /// Python Pose Analysis Service Integration Implementation
    /// </summary>
    public class PythonPoseService : ApplicationService, IPoseService
    {
        private readonly HttpClient _httpClient;
        private readonly string _poseServiceUrl;
        private readonly ILogger<PythonPoseService> _logger;

        public PythonPoseService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<PythonPoseService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _poseServiceUrl = configuration["PythonServices:PoseUrl"] ?? "http://localhost:5002";

            _logger.LogInformation($"Pose Service URL: {_poseServiceUrl}");

            // 设置超时时间 (姿态分析可能需要几秒)
            _httpClient.Timeout = TimeSpan.FromSeconds(30);
        }

        /// <summary>
        /// 分析静态姿态图片
        /// </summary>
        public async Task<PoseAnalysisResultDto> AnalyzeStaticPoseAsync(
            string standingImageBase64,
            string flexionImageBase64)
        {
            try
            {
                _logger.LogInformation("Sending images to pose analysis service...");

                // 构建请求
                var request = new
                {
                    standing_image = standingImageBase64,
                    flexion_image = flexionImageBase64
                };

                var json = JsonSerializer.Serialize(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // 调用Python Pose服务
                var response = await _httpClient.PostAsync(
                    $"{_poseServiceUrl}/pose/analyze-static",
                    content
                );

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Pose service returned error: {response.StatusCode}");
                    return new PoseAnalysisResultDto
                    {
                        Success = false,
                        Error = $"Pose service error: {response.StatusCode}"
                    };
                }

                // 解析响应
                var responseJson = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<PoseAnalysisResultDto>(
                    responseJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                _logger.LogInformation("Pose analysis completed successfully");
                return result;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Failed to connect to pose service");
                return new PoseAnalysisResultDto
                {
                    Success = false,
                    Error = $"Failed to connect to pose service: {ex.Message}"
                };
            }
            catch (TaskCanceledException ex)
            {
                _logger.LogError(ex, "Pose analysis timeout");
                return new PoseAnalysisResultDto
                {
                    Success = false,
                    Error = "Pose analysis timeout (>30 seconds)"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during pose analysis");
                return new PoseAnalysisResultDto
                {
                    Success = false,
                    Error = $"Unexpected error: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// 检查姿态分析服务健康状态
        /// </summary>
        public async Task<bool> CheckHealthAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_poseServiceUrl}/health");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Pose service health check failed");
                return false;
            }
        }
    }
}
