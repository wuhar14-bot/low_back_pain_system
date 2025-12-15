# Issue #004: Form Input Selectors Not Working

## Date
2025-12-15

## Status
RESOLVED

## Problem Description
Using generic selectors like `input` or index-based selection failed to fill form fields correctly.

**Symptoms:**
- Form fields remained empty after `page.fill()`
- Wrong fields were filled
- Inputs couldn't be located

## Root Cause
The form has multiple input fields, and generic selectors were unreliable. The application uses Chinese placeholders for form fields.

## Solution
Use placeholder-based selectors that match the actual placeholders in the form:

```javascript
// Study ID - matches placeholder containing "Study"
await page.fill('input[placeholder*="Study"]', 'TEST-123');

// Age - matches placeholder containing "年龄"
await page.fill('input[placeholder*="年龄"]', '35');

// Patient name - matches placeholder containing "患者姓名"
await page.fill('input[placeholder*="患者姓名"]', '测试患者');
```

## Selector Strategies for This Project

| Field | Selector | Notes |
|-------|----------|-------|
| Study ID | `input[placeholder*="Study"]` | English placeholder |
| Patient Name | `input[placeholder*="患者姓名"]` | Chinese placeholder |
| Age | `input[placeholder*="年龄"]` | Chinese placeholder |
| Gender | `text=男 >> nth=0` | Click text label |
| Phone | `input[placeholder*="电话"]` | Chinese placeholder |

## Useful Playwright Selectors

```javascript
// By placeholder (partial match)
await page.fill('input[placeholder*="关键词"]', 'value');

// By text content
await page.click('text=按钮文字');

// By nth occurrence
await page.click('text=选项 >> nth=0');  // First match

// By CSS class
await page.click('.btn-primary');

// By ID
await page.fill('#study-id', 'value');
```

## Lessons Learned
- Prefer unique selectors like placeholders or IDs over generic ones
- Chinese text in placeholders works fine with Playwright
- Use `*=` for partial attribute matching
- Test selectors in browser DevTools before using in scripts
