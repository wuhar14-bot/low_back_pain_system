using System.Collections.Generic;

namespace LowBackPainSystem.Services
{
    /// <summary>
    /// 姿态分析结果
    /// Pose Analysis Result
    /// </summary>
    public class PoseAnalysisResultDto
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
        /// ROM度数
        /// Range of Motion in degrees
        /// </summary>
        public double? RomDegrees { get; set; }

        /// <summary>
        /// ROM评估
        /// ROM assessment
        /// </summary>
        public string RomAssessment { get; set; }

        /// <summary>
        /// 站立躯干角度
        /// Standing trunk angle
        /// </summary>
        public double? StandingTrunkAngle { get; set; }

        /// <summary>
        /// 屈曲躯干角度
        /// Flexion trunk angle
        /// </summary>
        public double? FlexionTrunkAngle { get; set; }

        /// <summary>
        /// 骨盆倾斜角度
        /// Pelvic tilt angle
        /// </summary>
        public double? PelvicTilt { get; set; }

        /// <summary>
        /// 膝关节角度
        /// Knee angle
        /// </summary>
        public double? KneeAngle { get; set; }

        /// <summary>
        /// 补偿动作描述
        /// Compensation description
        /// </summary>
        public string Compensations { get; set; }

        /// <summary>
        /// 临床建议
        /// Clinical recommendations
        /// </summary>
        public string Recommendations { get; set; }

        /// <summary>
        /// 身体关键点数据
        /// Body landmarks data
        /// </summary>
        public List<LandmarkDto> Landmarks { get; set; }

        /// <summary>
        /// 带标注的图片 (Base64)
        /// Annotated images in Base64
        /// </summary>
        public AnnotatedImagesDto AnnotatedImages { get; set; }

        /// <summary>
        /// 处理时间 (秒)
        /// Processing time in seconds
        /// </summary>
        public double ProcessingTime { get; set; }
    }

    public class LandmarkDto
    {
        public double X { get; set; }
        public double Y { get; set; }
        public double Z { get; set; }
        public double Visibility { get; set; }
    }

    public class AnnotatedImagesDto
    {
        public string Standing { get; set; }
        public string Flexion { get; set; }
    }
}
