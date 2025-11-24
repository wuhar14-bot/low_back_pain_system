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
    /// Python OCR服务集成实现
    /// Python OCR Service Integration Implementation
    /// </summary>
    public class PythonOcrService : ApplicationService, IOcrService
    {
        private readonly HttpClient _httpClient;
        private readonly string _ocrServiceUrl;
        private readonly ILogger<PythonOcrService> _logger;

        public PythonOcrService(
            HttpClient httpClient,
            IConfiguration configuration,
            ILogger<PythonOcrService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _ocrServiceUrl = configuration["PythonServices:OcrUrl"] ?? "http://localhost:5001";

            _logger.LogInformation($"OCR Service URL: {_ocrServiceUrl}");
        }

        /// <summary>
        /// 处理单张图片的OCR
        /// </summary>
        public async Task<OcrResultDto> ProcessImageAsync(string base64Image)
        {
            try
            {
                _logger.LogInformation("Sending image to OCR service...");

                // 构建请求
                var request = new
                {
                    image = base64Image
                };

                var json = JsonSerializer.Serialize(request);
                var content = new StringContent(json, Encoding.UTF8, "application/json");

                // 调用Python OCR服务
                var response = await _httpClient.PostAsync(
                    $"{_ocrServiceUrl}/ocr/process",
                    content
                );

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"OCR service returned error: {response.StatusCode}");
                    return new OcrResultDto
                    {
                        Success = false,
                        Error = $"OCR service error: {response.StatusCode}"
                    };
                }

                // 解析响应
                var responseJson = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<OcrResultDto>(
                    responseJson,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                _logger.LogInformation("OCR processing completed successfully");
                return result;
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Failed to connect to OCR service");
                return new OcrResultDto
                {
                    Success = false,
                    Error = $"Failed to connect to OCR service: {ex.Message}"
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during OCR processing");
                return new OcrResultDto
                {
                    Success = false,
                    Error = $"Unexpected error: {ex.Message}"
                };
            }
        }

        /// <summary>
        /// 检查OCR服务健康状态
        /// </summary>
        public async Task<bool> CheckHealthAsync()
        {
            try
            {
                var response = await _httpClient.GetAsync($"{_ocrServiceUrl}/health");
                return response.IsSuccessStatusCode;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "OCR service health check failed");
                return false;
            }
        }
    }
}
