using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LowBackPain.Entities;
using Volo.Abp;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace LowBackPain.Patients;

/// <summary>
/// Patient Application Service
/// 患者应用服务实现
/// </summary>
public class PatientAppService : CrudAppService<
    Patient,
    PatientDto,
    Guid,
    PagedAndSortedResultRequestDto,
    CreatePatientDto,
    UpdatePatientDto>, IPatientAppService
{
    public PatientAppService(IRepository<Patient, Guid> repository)
        : base(repository)
    {
    }

    /// <summary>
    /// 根据 WorkspaceId 获取患者列表（分页）
    /// </summary>
    public async Task<PagedResultDto<PatientDto>> GetListByWorkspaceAsync(
        Guid workspaceId,
        PagedAndSortedResultRequestDto input)
    {
        var query = await Repository.GetQueryableAsync();
        query = query.Where(p => p.WorkspaceId == workspaceId);

        var totalCount = await AsyncExecuter.CountAsync(query);

        query = ApplyPaging(query, input);

        var entities = await AsyncExecuter.ToListAsync(query);
        var dtos = ObjectMapper.Map<List<Patient>, List<PatientDto>>(entities);

        return new PagedResultDto<PatientDto>(totalCount, dtos);
    }

    /// <summary>
    /// 根据 StudyId 获取患者
    /// </summary>
    public async Task<PatientDto> GetByStudyIdAsync(string studyId)
    {
        var patient = await Repository.FirstOrDefaultAsync(p => p.StudyId == studyId);
        if (patient == null)
        {
            throw new BusinessException("Patient with StudyId " + studyId + " not found");
        }

        return ObjectMapper.Map<Patient, PatientDto>(patient);
    }

    /// <summary>
    /// 检查 StudyId 是否已存在
    /// </summary>
    public async Task<bool> IsStudyIdExistsAsync(string studyId)
    {
        return await Repository.AnyAsync(p => p.StudyId == studyId);
    }

    /// <summary>
    /// 创建患者（覆盖以添加业务逻辑）
    /// </summary>
    public override async Task<PatientDto> CreateAsync(CreatePatientDto input)
    {
        // 检查 StudyId 是否已存在
        if (await IsStudyIdExistsAsync(input.StudyId))
        {
            throw new BusinessException("DUPLICATE_STUDY_ID")
                .WithData("studyId", input.StudyId);
        }

        var patient = new Patient(
            GuidGenerator.Create(),
            input.StudyId,
            input.Name,
            input.WorkspaceId,
            input.WorkspaceName ?? string.Empty,
            input.DoctorId,
            input.DoctorName ?? string.Empty);

        // 更新基本信息
        patient.UpdateBasicInfo(
            input.Name,
            input.Age,
            input.Gender,
            input.Phone,
            input.OnsetDate,
            input.ChiefComplaint);

        // 更新临床数据
        patient.UpdateClinicalData(
            input.MedicalHistoryJson,
            input.PainAreasJson,
            input.SubjectiveExamJson,
            input.ObjectiveExamJson,
            input.FunctionalScoresJson,
            input.AiPostureAnalysisJson,
            input.InterventionJson);

        patient.Remarks = input.Remarks;

        await Repository.InsertAsync(patient);

        return ObjectMapper.Map<Patient, PatientDto>(patient);
    }

    /// <summary>
    /// 更新患者（覆盖以添加业务逻辑）
    /// </summary>
    public override async Task<PatientDto> UpdateAsync(Guid id, UpdatePatientDto input)
    {
        var patient = await Repository.GetAsync(id);

        // 更新基本信息
        patient.UpdateBasicInfo(
            input.Name ?? patient.Name,
            input.Age ?? patient.Age,
            input.Gender ?? patient.Gender,
            input.Phone ?? patient.Phone,
            input.OnsetDate ?? patient.OnsetDate,
            input.ChiefComplaint ?? patient.ChiefComplaint);

        // 更新临床数据
        patient.UpdateClinicalData(
            input.MedicalHistoryJson ?? patient.MedicalHistoryJson,
            input.PainAreasJson ?? patient.PainAreasJson,
            input.SubjectiveExamJson ?? patient.SubjectiveExamJson,
            input.ObjectiveExamJson ?? patient.ObjectiveExamJson,
            input.FunctionalScoresJson ?? patient.FunctionalScoresJson,
            input.AiPostureAnalysisJson ?? patient.AiPostureAnalysisJson,
            input.InterventionJson ?? patient.InterventionJson);

        patient.Remarks = input.Remarks ?? patient.Remarks;

        await Repository.UpdateAsync(patient);

        return ObjectMapper.Map<Patient, PatientDto>(patient);
    }
}
