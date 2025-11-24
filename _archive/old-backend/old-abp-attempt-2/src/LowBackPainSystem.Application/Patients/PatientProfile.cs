using AutoMapper;

namespace LowBackPainSystem.Patients
{
    /// <summary>
    /// AutoMapper配置 - 患者实体和DTO映射
    /// AutoMapper Profile for Patient Entity and DTOs
    /// </summary>
    public class PatientProfile : Profile
    {
        public PatientProfile()
        {
            // Patient -> PatientDto
            CreateMap<Patient, PatientDto>();

            // CreatePatientDto -> Patient
            CreateMap<CreatePatientDto, Patient>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.WorkspaceId, opt => opt.Ignore())
                .ForMember(dest => dest.DoctorId, opt => opt.Ignore());

            // UpdatePatientDto -> Patient
            CreateMap<UpdatePatientDto, Patient>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.WorkspaceId, opt => opt.Ignore())
                .ForMember(dest => dest.DoctorId, opt => opt.Ignore())
                .ForMember(dest => dest.CreationTime, opt => opt.Ignore())
                .ForMember(dest => dest.CreatorId, opt => opt.Ignore());
        }
    }
}
