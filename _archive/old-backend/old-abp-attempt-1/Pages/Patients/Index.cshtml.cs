using System.Collections.Generic;
using System.Threading.Tasks;
using LowBackPainSystem.Entities;
using LowBackPainSystem.Services;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace LowBackPainSystem.Pages.Patients
{
    public class IndexModel : PageModel
    {
        private readonly IPatientAppService _patientAppService;

        public List<Patient> Patients { get; set; }

        public IndexModel(IPatientAppService patientAppService)
        {
            _patientAppService = patientAppService;
        }

        public async Task OnGetAsync()
        {
            Patients = await _patientAppService.GetListAsync();
        }
    }
}
