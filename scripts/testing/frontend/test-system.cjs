/**
 * System Test Script using Playwright
 * Tests the Low Back Pain System functionality
 */

const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:5173';
const CREDENTIALS = {
  username: 'admin',
  password: '1q2w3E*'
};

async function runTests() {
  console.log('Starting system tests...\n');

  const browser = await chromium.launch({
    headless: false,
    args: ['--ignore-certificate-errors']
  });

  const context = await browser.newContext({
    ignoreHTTPSErrors: true
  });

  const page = await context.newPage();

  const results = {
    passed: [],
    failed: []
  };

  try {
    // Test 1: Login
    console.log('Test 1: Login...');
    await page.goto(BASE_URL);
    await page.waitForSelector('input[id="email"]', { timeout: 10000 });

    await page.fill('input[id="email"]', CREDENTIALS.username);
    await page.fill('input[id="password"]', CREDENTIALS.password);
    await page.click('button[type="submit"]');

    // Wait for navigation after login
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    if (currentUrl.includes('/dashboard') || !currentUrl.includes('/login')) {
      results.passed.push('Login - Successfully logged in');
      console.log('  ✅ Login successful');
    } else {
      // Check for error message
      const errorText = await page.textContent('.alert, [role="alert"]').catch(() => '');
      results.failed.push(`Login - Failed: ${errorText || 'Unknown error'}`);
      console.log(`  ❌ Login failed: ${errorText}`);
    }

    // Test 2: Home Page (user lands here after login)
    console.log('Test 2: Home Page...');
    await page.waitForTimeout(2000);

    // Check if we can see the home page content (Chinese: 腰痛门诊)
    const pageContent = await page.content();
    if (pageContent.includes('腰痛门诊') || pageContent.includes('数据收集') || pageContent.includes('Low Back Pain')) {
      results.passed.push('Home Page - Home page loaded successfully');
      console.log('  ✅ Home page loaded');
    } else {
      results.failed.push('Home Page - Home page not loaded properly');
      console.log('  ❌ Home page not loaded');
    }

    // Test 3: Create Patient via "患者数据收集" card on Home page
    console.log('Test 3: Create Patient...');

    // Stay on Home page and click "患者数据收集" card
    // This card serves as the entry point for creating new patients
    const dataCollectionCard = await page.$('text=患者数据收集');

    if (dataCollectionCard) {
      await dataCollectionCard.click();
      await page.waitForTimeout(2000);

      // Check if we navigated to patient form or data collection page
      const currentUrl = page.url();
      if (currentUrl.includes('/patient') || currentUrl.includes('/data-collection') || currentUrl.includes('/form')) {
        results.passed.push('Create Patient - Patient data collection page opened');
        console.log('  ✅ Patient data collection page opened');

        // Check if form is visible
        const formVisible = await page.$('form, input, [data-testid="patient-form"]');
        if (formVisible) {
          console.log('  ✅ Form is ready for data entry');
        }
      } else {
        // Check page content for form elements
        const hasForm = await page.$('form, input[name], textarea');
        if (hasForm) {
          results.passed.push('Create Patient - Patient form loaded');
          console.log('  ✅ Patient form loaded');
        } else {
          results.failed.push('Create Patient - Could not load patient form');
          console.log('  ⚠️ Patient form not loaded');
        }
      }
    } else {
      results.failed.push('Create Patient - 患者数据收集 card not found');
      console.log('  ⚠️ 患者数据收集 card not found on home page');
    }

    // Test 4: View Patient Details
    console.log('Test 4: View Patient Details...');

    // Navigate back to patient list
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForTimeout(2000);

    // Try to click on a patient row
    const patientRow = await page.$('tr[data-patient-id], .patient-item, table tbody tr:first-child');
    if (patientRow) {
      await patientRow.click();
      await page.waitForTimeout(2000);

      if (page.url().includes('/patient/')) {
        results.passed.push('View Patient - Patient details page opened');
        console.log('  ✅ Patient details viewed');
      } else {
        results.failed.push('View Patient - Could not navigate to patient details');
        console.log('  ⚠️ Patient details navigation not working');
      }
    } else {
      results.passed.push('View Patient - No patients to view (empty list)');
      console.log('  ⚠️ No patients in list to view');
    }

    // Test 5: Logout
    console.log('Test 5: Logout...');

    // Navigate to Home page where logout button is visible
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(2000);

    // Look for logout button (with LogOut icon or title="Logout")
    // Home page has logout button in header with LogOut icon from lucide-react
    const logoutBtn = await page.$('button[title="Logout"], button:has-text("Logout"), button:has-text("Sign Out"), button:has(svg.lucide-log-out)');
    if (logoutBtn) {
      await logoutBtn.click();
      await page.waitForTimeout(2000);

      if (page.url().includes('/login') || page.url() === BASE_URL + '/') {
        results.passed.push('Logout - Successfully logged out');
        console.log('  ✅ Logout successful');
      } else {
        results.failed.push('Logout - Not redirected to login');
        console.log('  ❌ Logout did not redirect to login');
      }
    } else {
      results.failed.push('Logout - Logout button not found');
      console.log('  ⚠️ Logout button not found');
    }

  } catch (error) {
    console.error('Test error:', error.message);
    results.failed.push(`Test Error: ${error.message}`);
  } finally {
    // Print summary
    console.log('\n' + '='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`\nPassed: ${results.passed.length}`);
    results.passed.forEach(r => console.log(`  ✅ ${r}`));

    console.log(`\nFailed: ${results.failed.length}`);
    results.failed.forEach(r => console.log(`  ❌ ${r}`));

    console.log('\n' + '='.repeat(50));

    // Keep browser open for 5 seconds to see final state
    await page.waitForTimeout(5000);
    await browser.close();
  }
}

runTests().catch(console.error);
