using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Dynamic.Core;
using System.Threading.Tasks;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace LowBackPainSystem.Patients
{
    /// <summary>
    /// 患者应用服务实现
    /// Patient Application Service Implementation
    /// </summary>
    public class PatientAppService : ApplicationService, IPatientAppService
    {
        private readonly IRepository<Patient, Guid> _patientRepository;

        public PatientAppService(IRepository<Patient, Guid> patientRepository)
        {
            _patientRepository = patientRepository;
        }

        /// <summary>
        /// 获取患者详情
        /// </summary>
        public async Task<PatientDto> GetAsync(Guid id)
        {
            var patient = await _patientRepository.GetAsync(id);
            return ObjectMapper.Map<Patient, PatientDto>(patient);
        }

        /// <summary>
        /// 获取患者列表 (分页 + 过滤 + 排序)
        /// </summary>
        public async Task<PagedResultDto<PatientDto>> GetListAsync(GetPatientsInput input)
        {
            var queryable = await _patientRepository.GetQueryableAsync();

            // 应用过滤条件
            queryable = ApplyFilters(queryable, input);

            // 获取总数
            var totalCount = await AsyncExecuter.CountAsync(queryable);

            // 应用排序
            var sorting = input.Sorting ?? "CreationTime DESC";
            queryable = queryable.OrderBy(sorting);

            // 应用分页
            queryable = queryable
                .Skip(input.SkipCount)
                .Take(input.MaxResultCount);

            // 执行查询
            var patients = await AsyncExecuter.ToListAsync(queryable);

            return new PagedResultDto<PatientDto>(
                totalCount,
                ObjectMapper.Map<List<Patient>, List<PatientDto>>(patients)
            );
        }

        /// <summary>
        /// 创建新患者
        /// </summary>
        public async Task<PatientDto> CreateAsync(CreatePatientDto input)
        {
            var patient = new Patient(
                GuidGenerator.Create(),
                input.WorkspaceId,
                input.DoctorId,
                input.StudyId
            );

            // 映射属性
            ObjectMapper.Map(input, patient);

            // 保存到数据库
            await _patientRepository.InsertAsync(patient, autoSave: true);

            return ObjectMapper.Map<Patient, PatientDto>(patient);
        }

        /// <summary>
        /// 更新患者信息
        /// </summary>
        public async Task<PatientDto> UpdateAsync(Guid id, UpdatePatientDto input)
        {
            var patient = await _patientRepository.GetAsync(id);

            // 更新属性
            ObjectMapper.Map(input, patient);

            // 保存更改
            await _patientRepository.UpdateAsync(patient, autoSave: true);

            return ObjectMapper.Map<Patient, PatientDto>(patient);
        }

        /// <summary>
        /// 删除患者
        /// </summary>
        public async Task DeleteAsync(Guid id)
        {
            await _patientRepository.DeleteAsync(id);
        }

        /// <summary>
        /// 更新AI姿态分析结果
        /// </summary>
        public async Task<PatientDto> UpdatePoseAnalysisAsync(Guid id, string poseAnalysisJson)
        {
            var patient = await _patientRepository.GetAsync(id);

            // 更新姿态分析
            patient.UpdatePoseAnalysis(poseAnalysisJson);

            // 保存更改
            await _patientRepository.UpdateAsync(patient, autoSave: true);

            return ObjectMapper.Map<Patient, PatientDto>(patient);
        }

        /// <summary>
        /// 获取工作室的所有患者
        /// </summary>
        public async Task<ListResultDto<PatientDto>> GetByWorkspaceAsync(Guid workspaceId)
        {
            var queryable = await _patientRepository.GetQueryableAsync();
            queryable = queryable.Where(p => p.WorkspaceId == workspaceId)
                                 .OrderByDescending(p => p.CreationTime);

            var patients = await AsyncExecuter.ToListAsync(queryable);

            return new ListResultDto<PatientDto>(
                ObjectMapper.Map<List<Patient>, List<PatientDto>>(patients)
            );
        }

        /// <summary>
        /// 获取医生的所有患者
        /// </summary>
        public async Task<ListResultDto<PatientDto>> GetByDoctorAsync(Guid doctorId)
        {
            var queryable = await _patientRepository.GetQueryableAsync();
            queryable = queryable.Where(p => p.DoctorId == doctorId)
                                 .OrderByDescending(p => p.CreationTime);

            var patients = await AsyncExecuter.ToListAsync(queryable);

            return new ListResultDto<PatientDto>(
                ObjectMapper.Map<List<Patient>, List<PatientDto>>(patients)
            );
        }

        #region Private Methods

        /// <summary>
        /// 应用过滤条件
        /// </summary>
        private IQueryable<Patient> ApplyFilters(IQueryable<Patient> queryable, GetPatientsInput input)
        {
            // 工作室过滤
            if (input.WorkspaceId.HasValue)
            {
                queryable = queryable.Where(p => p.WorkspaceId == input.WorkspaceId.Value);
            }

            // 医生过滤
            if (input.DoctorId.HasValue)
            {
                queryable = queryable.Where(p => p.DoctorId == input.DoctorId.Value);
            }

            // 研究ID过滤
            if (!string.IsNullOrWhiteSpace(input.StudyId))
            {
                queryable = queryable.Where(p => p.StudyId.Contains(input.StudyId));
            }

            // 姓名搜索
            if (!string.IsNullOrWhiteSpace(input.Name))
            {
                queryable = queryable.Where(p => p.Name.Contains(input.Name));
            }

            // 性别过滤
            if (!string.IsNullOrWhiteSpace(input.Gender))
            {
                queryable = queryable.Where(p => p.Gender == input.Gender);
            }

            // 年龄范围过滤
            if (input.MinAge.HasValue)
            {
                queryable = queryable.Where(p => p.Age >= input.MinAge.Value);
            }

            if (input.MaxAge.HasValue)
            {
                queryable = queryable.Where(p => p.Age <= input.MaxAge.Value);
            }

            // 是否有AI分析
            if (input.HasAiAnalysis.HasValue && input.HasAiAnalysis.Value)
            {
                queryable = queryable.Where(p =>
                    !string.IsNullOrEmpty(p.AiPostureAnalysisJson) &&
                    p.AiPostureAnalysisJson != "{}"
                );
            }

            return queryable;
        }

        #endregion
    }
}
