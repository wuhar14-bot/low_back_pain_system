# Issues Log - Low Back Pain System

This folder documents development issues, bugs, and their solutions for the Low Back Pain System project.

## Issue Index

| # | Title | Status | Date |
|---|-------|--------|------|
| 001 | [Patient Name Required Validation Mismatch](001-patient-name-required-validation.md) | RESOLVED | 2025-12-15 |
| 002 | [Playwright ES Module Import Error](002-playwright-esm-module-error.md) | RESOLVED | 2025-12-15 |
| 003 | [Playwright Button Not Found - Navigation Flow](003-playwright-button-not-found.md) | RESOLVED | 2025-12-15 |
| 004 | [Form Input Selectors Not Working](004-form-input-selectors.md) | RESOLVED | 2025-12-15 |
| 005 | [Render Deployment Delay Causing Test Failures](005-render-deployment-delay.md) | EXPECTED BEHAVIOR | 2025-12-15 |

## Categories

### Backend Issues
- #001 - Validation mismatch

### Testing Issues
- #002 - ES Module syntax
- #003 - Navigation flow
- #004 - Form selectors

### Deployment Issues
- #005 - Render deployment delay

## How to Add New Issues

1. Create a new file: `XXX-short-description.md`
2. Use the template:
   ```markdown
   # Issue #XXX: Title

   ## Date
   YYYY-MM-DD

   ## Status
   OPEN / INVESTIGATING / RESOLVED / EXPECTED BEHAVIOR

   ## Problem Description
   What went wrong?

   ## Root Cause
   Why did it happen?

   ## Solution
   How was it fixed?

   ## Lessons Learned
   What can we learn from this?
   ```

3. Update this README with the new issue

## Quick Reference

### Common Error Patterns

| Error | Likely Cause | Solution |
|-------|--------------|----------|
| `require is not defined` | ES Module project | Use `import` instead |
| `HTTP 400 validation` | Backend field required | Check DTO attributes |
| `HTTP 500 internal error` | Backend code error | Check server logs |
| `Timeout waiting for selector` | Element not visible | Check navigation flow |
