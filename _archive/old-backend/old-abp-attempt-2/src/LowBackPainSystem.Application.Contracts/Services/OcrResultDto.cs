using System.Collections.Generic;

namespace LowBackPainSystem.Services
{
    /// <summary>
    /// OCR处理结果
    /// OCR Processing Result
    /// </summary>
    public class OcrResultDto
    {
        /// <summary>
        /// 是否成功
        /// Success status
        /// </summary>
        public bool Success { get; set; }

        /// <summary>
        /// 错误消息
        /// Error message
        /// </summary>
        public string Error { get; set; }

        /// <summary>
        /// 提取的字段
        /// Extracted fields
        /// </summary>
        public Dictionary<string, string> ExtractedFields { get; set; }

        /// <summary>
        /// 识别的所有文本
        /// All recognized text
        /// </summary>
        public List<string> AllText { get; set; }

        /// <summary>
        /// 处理时间 (秒)
        /// Processing time in seconds
        /// </summary>
        public double ProcessingTime { get; set; }
    }
}
