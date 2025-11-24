using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace LowBackPainSystem.Entities
{
    /// <summary>
    /// 患者实体 - 腰痛数据收集系统
    /// Patient entity for Low Back Pain Data Collection System
    /// </summary>
    public class Patient : FullAuditedAggregateRoot<Guid>
    {
        #region 基础信息 (Basic Information)

        /// <summary>
        /// 研究ID - 用户自定义的研究标识符
        /// Study ID - User-defined study identifier
        /// </summary>
        public string StudyId { get; set; }

        /// <summary>
        /// 工作室ID - 关联到现有系统的工作室
        /// Workspace ID - Links to existing system workspace
        /// </summary>
        public Guid WorkspaceId { get; set; }

        /// <summary>
        /// 医生ID - 负责该患者的医生
        /// Doctor ID - Doctor responsible for this patient
        /// </summary>
        public Guid DoctorId { get; set; }

        #endregion

        #region 患者信息 (Patient Demographics)

        /// <summary>
        /// 患者姓名 (可匿名化)
        /// Patient name (can be anonymized)
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// 性别: "男" or "女"
        /// Gender: "男" (Male) or "女" (Female)
        /// </summary>
        public string Gender { get; set; }

        /// <summary>
        /// 年龄 (岁)
        /// Age in years
        /// </summary>
        public int? Age { get; set; }

        /// <summary>
        /// 联系电话
        /// Contact phone number
        /// </summary>
        public string Phone { get; set; }

        #endregion

        #region 医疗信息 (Medical Information)

        /// <summary>
        /// 症状发作日期
        /// Onset date of symptoms
        /// </summary>
        public DateTime? OnsetDate { get; set; }

        /// <summary>
        /// 主诉
        /// Chief complaint
        /// </summary>
        public string ChiefComplaint { get; set; }

        /// <summary>
        /// 既往病史
        /// Medical history
        /// </summary>
        public string MedicalHistory { get; set; }

        /// <summary>
        /// 疼痛部位 (JSON数组)
        /// Pain areas as JSON array
        /// Example: ["lower_back", "left_leg", "right_leg"]
        /// </summary>
        public string PainAreasJson { get; set; }

        #endregion

        #region 临床检查 (Clinical Examination)

        /// <summary>
        /// 主观检查结果
        /// Subjective examination findings
        /// </summary>
        public string SubjectiveExam { get; set; }

        /// <summary>
        /// 客观检查结果
        /// Objective examination findings
        /// </summary>
        public string ObjectiveExam { get; set; }

        /// <summary>
        /// 功能评分 (JSON对象)
        /// Functional scores as JSON object
        /// Example: {"oswestry": 42, "vas": 7, "sf36_physical": 65}
        /// </summary>
        public string FunctionalScoresJson { get; set; }

        /// <summary>
        /// 干预措施/治疗方案
        /// Intervention/treatment plan
        /// </summary>
        public string Intervention { get; set; }

        #endregion

        #region AI分析 (AI Analysis)

        /// <summary>
        /// AI姿态分析结果 (JSON对象)
        /// AI posture analysis results as JSON object
        /// MediaPipe pose estimation data including ROM, trunk angles, compensations
        /// </summary>
        public string AiPostureAnalysisJson { get; set; }

        #endregion

        #region 附加信息 (Additional Information)

        /// <summary>
        /// 备注
        /// Remarks/notes
        /// </summary>
        public string Remarks { get; set; }

        /// <summary>
        /// 完整数据备份 (JSON)
        /// Complete data backup as JSON
        /// </summary>
        public string DataJson { get; set; }

        #endregion

        #region 构造函数 (Constructors)

        /// <summary>
        /// 无参构造函数 (EF Core 需要)
        /// Parameterless constructor for EF Core
        /// </summary>
        protected Patient()
        {
        }

        /// <summary>
        /// 创建新患者
        /// Create new patient
        /// </summary>
        public Patient(
            Guid id,
            Guid workspaceId,
            Guid doctorId,
            string studyId = null
        ) : base(id)
        {
            WorkspaceId = workspaceId;
            DoctorId = doctorId;
            StudyId = studyId;
        }

        #endregion

        #region 业务方法 (Business Methods)

        /// <summary>
        /// 更新AI姿态分析
        /// Update AI posture analysis
        /// </summary>
        public void UpdatePoseAnalysis(string poseAnalysisJson)
        {
            AiPostureAnalysisJson = poseAnalysisJson;
        }

        /// <summary>
        /// 更新功能评分
        /// Update functional scores
        /// </summary>
        public void UpdateFunctionalScores(string functionalScoresJson)
        {
            FunctionalScoresJson = functionalScoresJson;
        }

        #endregion
    }
}
