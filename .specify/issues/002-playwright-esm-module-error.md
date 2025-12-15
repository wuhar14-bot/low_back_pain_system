# Issue #002: Playwright ES Module Import Error

## Date
2025-12-15

## Status
RESOLVED

## Problem Description
Running Playwright test script failed with ES Module error.

**Error Message:**
```
ReferenceError: require is not defined in ES module scope
```

## Root Cause
Project uses `"type": "module"` in `package.json`, which means all `.js` files are treated as ES modules. ES modules use `import` syntax, not `require`.

## Files Affected
- `test-submit.js`

## Solution
Changed from CommonJS `require` to ES Module `import` syntax:

```javascript
// Before (CommonJS):
const { chromium } = require('playwright');

// After (ES Module):
import { chromium } from 'playwright';
```

## Related Configuration
In `package.json`:
```json
{
  "type": "module"
}
```

## Testing
```bash
node test-submit.js
```
Script runs successfully after the change.

## Lessons Learned
- Check `package.json` for `"type": "module"` before writing import statements
- ES Modules: Use `import ... from '...'`
- CommonJS: Use `const ... = require('...')`
- Cannot mix ES Module and CommonJS syntax in the same file
