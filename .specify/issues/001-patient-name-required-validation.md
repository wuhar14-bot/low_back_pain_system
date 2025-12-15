# Issue #001: Patient Name Required Validation Mismatch

## Date
2025-12-15

## Status
RESOLVED

## Problem Description
Frontend allowed submitting patient data without a name, but backend returned 400 error with "The Name field is required".

**Error Message:**
```
HTTP 400: Validation failed: Name: The Name field is required
```

## Root Cause
Frontend/Backend inconsistency:
- **Frontend**: Patient name field had no asterisk (*), treating it as optional
- **Backend**: `CreatePatientDto.cs` had `[Required]` attribute on `Name` property

## Files Affected
1. `backend-dotnet/aspnet-core/src/LowBackPain.Application.Contracts/Patients/CreatePatientDto.cs`
2. `backend-dotnet/aspnet-core/src/LowBackPain.Domain/Entities/Patient.cs`

## Solution
Made patient name optional in backend to match frontend design:

### 1. CreatePatientDto.cs
```csharp
// Before:
[Required]
[StringLength(200)]
public string Name { get; set; }

// After:
[StringLength(200)]
public string? Name { get; set; }
```

### 2. Patient.cs - Constructor
```csharp
// Before:
public Patient(Guid id, string studyId, string name, ...)

// After:
public Patient(Guid id, string studyId, string? name, ...)
```

### 3. Patient.cs - UpdateBasicInfo Method
```csharp
// Before:
public void UpdateBasicInfo(string name, int? age, ...)

// After:
public void UpdateBasicInfo(string? name, int? age, ...)
```

## Commits
- `9cae8bd`: fix(backend): Make patient Name field optional to match frontend
- `678d8ec`: fix(backend): Make Name parameter nullable in Patient constructor and UpdateBasicInfo

## Testing
Used Playwright automated test (`test-submit.js`) to verify:
1. Skip patient name field
2. Fill only Study ID, Age, Gender
3. Submit form
4. Verify success response

## Lessons Learned
- Always ensure frontend validation matches backend validation
- Use nullable types (`string?`) for optional fields in C#
- Constructor parameters must also be nullable if the property is nullable
