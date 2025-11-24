using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using LowBackPainSystem.Entities;

namespace LowBackPainSystem.Services
{
    public interface IPatientAppService
    {
        Task<List<Patient>> GetListAsync();
        Task<Patient> GetAsync(Guid id);
        Task<Patient> CreateAsync(Patient input);
        Task<Patient> UpdateAsync(Guid id, Patient input);
        Task DeleteAsync(Guid id);
    }
}
