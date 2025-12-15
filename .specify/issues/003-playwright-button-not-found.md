# Issue #003: Playwright Button Not Found - Navigation Flow

## Date
2025-12-15

## Status
RESOLVED

## Problem Description
Playwright test failed to find "开始数据收集" button on page load.

**Error Message:**
```
Timeout: locator.click: Timeout 10000ms exceeded.
waiting for locator('text=开始数据收集')
```

## Root Cause
The application has a multi-step navigation flow:
1. Dashboard page shows cards
2. Click "患者数据收集" card to enter welcome page
3. Welcome page shows "开始数据收集" button

The test was trying to click "开始数据收集" directly on the dashboard, but this button only appears after clicking the "患者数据收集" card first.

## Solution
Updated test script to follow the correct navigation flow:

```javascript
// Step 1: Click the card on dashboard
console.log('📍 Clicking "患者数据收集" card...');
await page.click('text=患者数据收集');
await page.waitForTimeout(3000);

// Step 2: Now click the button on welcome page
console.log('📍 Clicking "开始数据收集" button...');
await page.click('text=开始数据收集', { timeout: 10000 });
```

## Screenshots
Screenshots are saved at each step to debug navigation issues:
- `1-dashboard.png` - Dashboard with cards
- `2-welcome.png` - Welcome page with button
- `2-basic-info.png` - Basic info form

## Lessons Learned
- Always understand the application's navigation flow before writing tests
- Use screenshots at each step to debug navigation issues
- Add appropriate wait times between page transitions
- Test selectors in browser DevTools first
