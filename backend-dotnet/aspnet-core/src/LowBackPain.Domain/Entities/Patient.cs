using System;
using System.Collections.Generic;
using Volo.Abp.Domain.Entities.Auditing;

namespace LowBackPain.Entities;

/// <summary>
/// Patient Entity - 患者实体
/// 包含患者基本信息、临床数据和外部系统关联信息
/// </summary>
public class Patient : FullAuditedAggregateRoot<Guid>
{
    // ==================== 基本信息 ====================

    /// <summary>
    /// Study ID - 研究编号（唯一标识）
    /// </summary>
    public string StudyId { get; set; }

    /// <summary>
    /// 患者姓名
    /// </summary>
    public string Name { get; set; }

    /// <summary>
    /// 年龄
    /// </summary>
    public int? Age { get; set; }

    /// <summary>
    /// 性别 (男/女)
    /// </summary>
    public string Gender { get; set; }

    /// <summary>
    /// 联系电话
    /// </summary>
    public string Phone { get; set; }

    /// <summary>
    /// 发病日期
    /// </summary>
    public DateTime? OnsetDate { get; set; }

    /// <summary>
    /// 主诉
    /// </summary>
    public string ChiefComplaint { get; set; }

    // ==================== 外部系统关联 ====================

    /// <summary>
    /// 工作室ID（来自外部系统）
    /// </summary>
    public Guid WorkspaceId { get; set; }

    /// <summary>
    /// 工作室名称（冗余存储，便于查询显示）
    /// </summary>
    public string WorkspaceName { get; set; }

    /// <summary>
    /// 医生ID（来自外部系统）
    /// </summary>
    public Guid DoctorId { get; set; }

    /// <summary>
    /// 医生姓名（冗余存储，便于查询显示）
    /// </summary>
    public string DoctorName { get; set; }

    // ==================== 临床数据 (JSON 存储) ====================

    /// <summary>
    /// 病史资料 JSON
    /// 包含：既往治疗史、手术史、用药史、过敏史等
    /// </summary>
    public string MedicalHistoryJson { get; set; }

    /// <summary>
    /// 疼痛区域 JSON
    /// 数组格式，每个区域包含：区域名称、强度、描述等
    /// </summary>
    public string PainAreasJson { get; set; }

    /// <summary>
    /// 主观检查 JSON
    /// 包含：疼痛持续时间、疼痛模式、加重因素、缓解因素等
    /// </summary>
    public string SubjectiveExamJson { get; set; }

    /// <summary>
    /// 客观检查 JSON
    /// 包含：活动度、神经学检查、特殊测试等
    /// </summary>
    public string ObjectiveExamJson { get; set; }

    /// <summary>
    /// 功能评分 JSON
    /// 包含：VAS、Oswestry、Roland-Morris 等评分
    /// </summary>
    public string FunctionalScoresJson { get; set; }

    /// <summary>
    /// AI 姿势分析 JSON
    /// 包含：站立躯干角、屈曲躯干角、ROM 度数、代偿模式等
    /// </summary>
    public string AiPostureAnalysisJson { get; set; }

    /// <summary>
    /// 干预建议 JSON
    /// 包含：诊断、治疗计划、建议等
    /// </summary>
    public string InterventionJson { get; set; }

    // ==================== 关联实体 ====================

    /// <summary>
    /// 患者图像集合
    /// </summary>
    public virtual ICollection<PatientImage> Images { get; set; }

    // ==================== 其他字段 ====================

    /// <summary>
    /// 备注
    /// </summary>
    public string Remarks { get; set; }

    // ==================== 构造函数 ====================

    protected Patient()
    {
        // For ORM
        Images = new List<PatientImage>();
    }

    public Patient(
        Guid id,
        string studyId,
        string name,
        Guid workspaceId,
        string workspaceName,
        Guid doctorId,
        string doctorName) : base(id)
    {
        StudyId = studyId;
        Name = name;
        WorkspaceId = workspaceId;
        WorkspaceName = workspaceName;
        DoctorId = doctorId;
        DoctorName = doctorName;
        Images = new List<PatientImage>();
    }

    // ==================== 业务方法 ====================

    /// <summary>
    /// 更新基本信息
    /// </summary>
    public void UpdateBasicInfo(
        string name,
        int? age,
        string gender,
        string phone,
        DateTime? onsetDate,
        string chiefComplaint)
    {
        Name = name;
        Age = age;
        Gender = gender;
        Phone = phone;
        OnsetDate = onsetDate;
        ChiefComplaint = chiefComplaint;
    }

    /// <summary>
    /// 更新临床数据
    /// </summary>
    public void UpdateClinicalData(
        string medicalHistoryJson,
        string painAreasJson,
        string subjectiveExamJson,
        string objectiveExamJson,
        string functionalScoresJson,
        string aiPostureAnalysisJson,
        string interventionJson)
    {
        MedicalHistoryJson = medicalHistoryJson;
        PainAreasJson = painAreasJson;
        SubjectiveExamJson = subjectiveExamJson;
        ObjectiveExamJson = objectiveExamJson;
        FunctionalScoresJson = functionalScoresJson;
        AiPostureAnalysisJson = aiPostureAnalysisJson;
        InterventionJson = interventionJson;
    }
}
