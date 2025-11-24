using AutoMapper;
using LowBackPain.Entities;
using LowBackPain.Patients;

namespace LowBackPain;

public class LowBackPainApplicationAutoMapperProfile : Profile
{
    public LowBackPainApplicationAutoMapperProfile()
    {
        /* You can configure your AutoMapper mapping configuration here.
         * Alternatively, you can split your mapping configurations
         * into multiple profile classes for a better organization. */

        // Patient mappings
        CreateMap<Patient, PatientDto>();
        CreateMap<CreatePatientDto, Patient>();
        CreateMap<UpdatePatientDto, Patient>();
    }
}
