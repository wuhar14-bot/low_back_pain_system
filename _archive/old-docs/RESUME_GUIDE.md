# Resume Guide - Low Back Pain System Development

## Current Status (2025-11-13)

### Project Overview
- **Project**: Low Back Pain Patient Data Collection System
- **Framework**: ABP vNext 7.4.5 (ASP.NET Core)
- **Database**: PostgreSQL with snake_case naming
- **Frontend**: Bootstrap 5 + Razor Pages
- **Location**: `E:\claude-code\low back pain system\LowBackPainSystem`

### Application Running Status
- **URL**: https://localhost:44366
- **Status**: Application is running in multiple background shells
- **Key URLs**:
  - Homepage: https://localhost:44366
  - Patient List: https://localhost:44366/Patients
  - Patient Create: https://localhost:44366/Patients/Create

### Active Background Shells
Multiple `dotnet run` processes are running. Check their status with:
```powershell
# List all background shells
/bashes

# Check specific shell output (replace <shell_id> with actual ID)
BashOutput tool with bash_id: "abef54" (most recent)
```

## Current Issue Being Debugged

### Problem
**Patient Create page not displaying correctly** - User reports seeing blank page or not seeing the 6 modules.

### Six Modules (Tab Sections)
1. **基本信息 / Basic Information** - Study ID, Name, Gender, Age, Phone, Onset Date
2. **病史资料 / Medical History** - Chief Complaint, Medical History
3. **主观检查 / Subjective Examination** - Subjective exam findings
4. **客观检查 / Objective Examination** - Objective exam, AI posture analysis
5. **功能评分 / Functional Scores** - Functional scores JSON data
6. **干预建议 / Intervention** - Treatment intervention, Remarks

### Investigation Findings
- **Create.cshtml** and **Create.cshtml.cs** files exist and are correctly implemented
- **Server logs** show no requests to `/Patients/Create` endpoint (user may not have accessed it yet)
- **Button link** in Index.cshtml is correct: `href="/Patients/Create"`
- **Form structure** uses Bootstrap nav-pills for tab navigation with JavaScript prev/next buttons

### Files Involved
1. `E:\claude-code\low back pain system\LowBackPainSystem\Pages\Patients\Create.cshtml` - View with 6-tab form
2. `E:\claude-code\low back pain system\LowBackPainSystem\Pages\Patients\Create.cshtml.cs` - PageModel with PatientInputModel
3. `E:\claude-code\low back pain system\LowBackPainSystem\Pages\Patients\Index.cshtml` - Patient list page
4. `E:\claude-code\low back pain system\LowBackPainSystem\Data\LowBackPainSystemDbContext.cs` - EF Core mappings

## Next Steps After Restart

### 1. Check Application Status
```powershell
# Check if application is still running
Get-Process -Name "dotnet" -ErrorAction SilentlyContinue

# If not running, start application
cd "E:\claude-code\low back pain system\LowBackPainSystem"
dotnet run
```

### 2. Use Puppeteer MCP to Debug Browser
**NEW MCP Configured**: `puppeteer` MCP has been added to `E:\claude-data\.claude\mcp.json`

After Claude Code restart, the Puppeteer MCP will be available. Use it to:
1. Navigate to https://localhost:44366/Patients/Create
2. Take screenshot of the page
3. Check browser console for JavaScript errors
4. Inspect DOM to verify HTML rendering
5. Test tab navigation functionality

### 3. Alternative Debug Methods
If Puppeteer MCP not working:
- Ask user to manually access https://localhost:44366/Patients/Create
- Request user to press F12 and share Console tab errors
- Request user to View Page Source (Ctrl+U) to verify HTML content
- Check server logs for any errors during page rendering

## Todo List Status

Current tasks (from TodoWrite):
1. ✅ **[COMPLETED]** Create complete patient data entry form with all 6 sections
2. ⏳ **[PENDING]** Create patient detail view page
3. ⏳ **[PENDING]** Add edit patient functionality

## Database Schema Reference

### Patients Table (snake_case columns)
- `id` (Guid, PK)
- `study_id` (string, required)
- `workspace_id` (Guid)
- `doctor_id` (Guid)
- `name`, `gender`, `age`, `phone`
- `onset_date` (DateTime?)
- `chief_complaint`, `medical_history`, `subjective_exam`, `objective_exam`, `intervention`, `remarks`
- **JSONB columns**: `pain_areas`, `functional_scores`, `ai_posture_analysis`, `data_json`
- Audit fields: `creation_time`, `creator_id`, `last_modification_time`, etc.

### Key Entity Framework Mappings
All entities ignore ABP's `ConcurrencyStamp` and `ExtraProperties` fields:
```csharp
b.Ignore(x => x.ConcurrencyStamp);
b.Ignore(x => x.ExtraProperties);
```

## Important Commands

### Build and Run
```powershell
cd "E:\claude-code\low back pain system\LowBackPainSystem"
dotnet build
dotnet run
```

### Database Migrations
```powershell
cd "E:\claude-code\low back pain system\LowBackPainSystem"
dotnet ef database update
```

### Check Logs
```powershell
# View application logs (if running in background shell)
BashOutput tool with appropriate bash_id
```

## MCP Configuration

### File: `E:\claude-data\.claude\mcp.json`
```json
{
  "mcpServers": {
    "chrome": {
      "command": "npx",
      "args": ["-y", "@yuval1024/chrome-mcp"]
    },
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

**Note**: Puppeteer MCP will be active after Claude Code restart.

## Key Questions to Ask User After Restart

1. Is the application still running? (Check https://localhost:44366)
2. Can you access the Patient List page? (https://localhost:44366/Patients)
3. What happens when you click "新增患者 / Add Patient" button?
4. Can you try directly accessing https://localhost:44366/Patients/Create in browser?

## Expected Behavior

When Create page loads correctly, user should see:
- Page header: "新增患者 / Add New Patient"
- 6 horizontal tab buttons (nav-pills) at top
- Active tab shows "基本信息 / Basic Information" section by default
- "上一步" (Previous) and "下一步" (Next) buttons at bottom
- "保存 / Save" button to submit form
- "取消 / Cancel" button to return to list

## Troubleshooting Checklist

- [ ] Application is running on https://localhost:44366
- [ ] Database migrations applied successfully
- [ ] No compilation errors in Create.cshtml or Create.cshtml.cs
- [ ] Bootstrap 5 CSS/JS loading correctly in _Layout.cshtml
- [ ] No JavaScript errors in browser console
- [ ] User is actually accessing `/Patients/Create` URL (not just `/Patients`)

## Resume Command

After restart, say:
```
继续调试患者创建页面。我已经配置了Puppeteer MCP，现在可以使用它来检查浏览器显示情况。
(Continue debugging patient create page. I've configured Puppeteer MCP and can now use it to check browser display.)
```

---

**Last Updated**: 2025-11-13
**Created By**: Claude (Session before restart)
