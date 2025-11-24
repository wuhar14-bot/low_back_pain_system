using System;
using System.Threading.Tasks;
using LowBackPainSystem.Entities;
using LowBackPainSystem.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LowBackPainSystem.Pages.Patients
{
    public class CreateModel : PageModel
    {
        private readonly IPatientAppService _patientAppService;

        [BindProperty]
        public PatientInputModel Input { get; set; }

        public CreateModel(IPatientAppService patientAppService)
        {
            _patientAppService = patientAppService;
            Input = new PatientInputModel();
        }

        public void OnGet()
        {
        }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }

            try
            {
                var patient = new Patient(
                    Guid.NewGuid(),
                    Input.WorkspaceId ?? Guid.Empty,
                    Input.DoctorId ?? Guid.Empty,
                    Input.StudyId
                )
                {
                    Name = Input.Name,
                    Gender = Input.Gender,
                    Age = Input.Age,
                    Phone = Input.Phone,
                    OnsetDate = Input.OnsetDate,
                    ChiefComplaint = Input.ChiefComplaint,
                    MedicalHistory = Input.MedicalHistory,
                    SubjectiveExam = Input.SubjectiveExam,
                    ObjectiveExam = Input.ObjectiveExam,
                    Intervention = Input.Intervention,
                    Remarks = Input.Remarks,
                    PainAreasJson = Input.PainAreasJson,
                    FunctionalScoresJson = Input.FunctionalScoresJson,
                    AiPostureAnalysisJson = Input.AiPostureAnalysisJson,
                    DataJson = Input.DataJson
                };

                await _patientAppService.CreateAsync(patient);
                return RedirectToPage("./Index");
            }
            catch (Exception ex)
            {
                ModelState.AddModelError(string.Empty, $"保存失败: {ex.Message}");
                return Page();
            }
        }
    }

    public class PatientInputModel
    {
        public Guid? WorkspaceId { get; set; }
        public Guid? DoctorId { get; set; }
        public string StudyId { get; set; }
        public string Name { get; set; }
        public string Gender { get; set; }
        public int? Age { get; set; }
        public string Phone { get; set; }
        public DateTime? OnsetDate { get; set; }
        public string ChiefComplaint { get; set; }
        public string MedicalHistory { get; set; }
        public string SubjectiveExam { get; set; }
        public string ObjectiveExam { get; set; }
        public string Intervention { get; set; }
        public string Remarks { get; set; }
        public string PainAreasJson { get; set; }
        public string FunctionalScoresJson { get; set; }
        public string AiPostureAnalysisJson { get; set; }
        public string DataJson { get; set; }
    }
}
