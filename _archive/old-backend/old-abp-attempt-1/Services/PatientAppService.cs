using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LowBackPainSystem.Data;
using LowBackPainSystem.Entities;
using Microsoft.EntityFrameworkCore;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;

namespace LowBackPainSystem.Services
{
    public class PatientAppService : ApplicationService, IPatientAppService
    {
        private readonly IRepository<Patient, Guid> _patientRepository;

        public PatientAppService(IRepository<Patient, Guid> patientRepository)
        {
            _patientRepository = patientRepository;
        }

        public async Task<List<Patient>> GetListAsync()
        {
            return await _patientRepository.GetListAsync();
        }

        public async Task<Patient> GetAsync(Guid id)
        {
            return await _patientRepository.GetAsync(id);
        }

        public async Task<Patient> CreateAsync(Patient input)
        {
            return await _patientRepository.InsertAsync(input, autoSave: true);
        }

        public async Task<Patient> UpdateAsync(Guid id, Patient input)
        {
            var patient = await _patientRepository.GetAsync(id);

            // Update properties
            patient.Name = input.Name;
            patient.Gender = input.Gender;
            patient.Age = input.Age;
            patient.Phone = input.Phone;
            patient.OnsetDate = input.OnsetDate;
            patient.ChiefComplaint = input.ChiefComplaint;
            patient.MedicalHistory = input.MedicalHistory;
            patient.PainAreasJson = input.PainAreasJson;
            patient.SubjectiveExam = input.SubjectiveExam;
            patient.ObjectiveExam = input.ObjectiveExam;
            patient.FunctionalScoresJson = input.FunctionalScoresJson;
            patient.Intervention = input.Intervention;
            patient.Remarks = input.Remarks;

            return await _patientRepository.UpdateAsync(patient, autoSave: true);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _patientRepository.DeleteAsync(id);
        }
    }
}
