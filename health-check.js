import { chromium } from 'playwright';

const FRONTEND_URL = 'https://low-back-pain-system.onrender.com';
const BACKEND_URL = 'https://low-back-pain-backend.onrender.com';

async function healthCheck() {
  console.log('🏥 LBP System Health Check');
  console.log('=' .repeat(50));
  console.log(`📅 ${new Date().toISOString()}\n`);

  const results = {
    backend: false,
    frontend: false,
    pageLoad: false,
    navigation: false,
    i18n: false
  };

  // Check backend API
  console.log('1️⃣ Checking Backend API...');
  try {
    const response = await fetch(`${BACKEND_URL}/swagger/v1/swagger.json`);
    if (response.ok) {
      console.log('   ✅ Backend API: Online');
      results.backend = true;
    } else {
      console.log(`   ❌ Backend API: HTTP ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Backend API: ${error.message}`);
  }

  // Check frontend with Playwright
  console.log('\n2️⃣ Checking Frontend (Playwright)...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  try {
    // Test page load
    console.log('   📍 Loading page...');
    const response = await page.goto(FRONTEND_URL, {
      waitUntil: 'networkidle',
      timeout: 60000
    });

    if (response.ok()) {
      console.log('   ✅ Frontend: Accessible');
      results.frontend = true;
    }

    // Wait for React to render
    await page.waitForTimeout(3000);

    // Check if main content loaded
    const title = await page.title();
    console.log(`   📄 Page Title: "${title}"`);

    // Check for key elements
    const hasContent = await page.$('body');
    if (hasContent) {
      const bodyText = await page.textContent('body');

      // Check for Chinese content (default language)
      if (bodyText.includes('腰痛') || bodyText.includes('患者') || bodyText.includes('数据')) {
        console.log('   ✅ Page Load: Content rendered');
        results.pageLoad = true;
      } else if (bodyText.includes('Low Back') || bodyText.includes('Patient')) {
        console.log('   ✅ Page Load: English content rendered');
        results.pageLoad = true;
      }
    }

    // Test navigation - click on data collection card
    console.log('\n3️⃣ Testing Navigation...');
    try {
      // Look for the data collection card
      const dataCard = await page.$('text=患者数据收集');
      const dataCardEn = await page.$('text=Patient Data Collection');

      if (dataCard || dataCardEn) {
        console.log('   ✅ Navigation: Dashboard cards visible');
        results.navigation = true;
      } else {
        console.log('   ⚠️ Navigation: Cards not found (may need different selector)');
      }
    } catch (e) {
      console.log(`   ❌ Navigation: ${e.message}`);
    }

    // Test i18n - check for language selector
    console.log('\n4️⃣ Testing i18n...');
    try {
      const langSelector = await page.$('[class*="language"], [data-testid="language-selector"], button:has-text("中文"), button:has-text("EN")');
      if (langSelector) {
        console.log('   ✅ i18n: Language selector found');
        results.i18n = true;
      } else {
        // Check if there's any language-related element
        const hasLangText = await page.textContent('body');
        if (hasLangText.includes('中文') || hasLangText.includes('English') || hasLangText.includes('繁體')) {
          console.log('   ✅ i18n: Language options available');
          results.i18n = true;
        } else {
          console.log('   ⚠️ i18n: Language selector not visible');
        }
      }
    } catch (e) {
      console.log(`   ❌ i18n: ${e.message}`);
    }

    // Take screenshot
    await page.screenshot({
      path: 'E:\\claude-code\\low back pain system\\health-check-screenshot.png',
      fullPage: true
    });
    console.log('\n📸 Screenshot saved: health-check-screenshot.png');

  } catch (error) {
    console.log(`   ❌ Frontend Error: ${error.message}`);
  } finally {
    await browser.close();
  }

  // Report console errors if any
  if (errors.length > 0) {
    console.log('\n⚠️ Console Errors:');
    errors.slice(0, 5).forEach(e => console.log(`   - ${e.substring(0, 100)}`));
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 HEALTH CHECK SUMMARY');
  console.log('='.repeat(50));

  const checks = [
    ['Backend API', results.backend],
    ['Frontend Access', results.frontend],
    ['Page Load', results.pageLoad],
    ['Navigation', results.navigation],
    ['i18n Support', results.i18n]
  ];

  let passed = 0;
  checks.forEach(([name, status]) => {
    console.log(`   ${status ? '✅' : '❌'} ${name}`);
    if (status) passed++;
  });

  console.log('\n' + '='.repeat(50));
  console.log(`   ${passed}/${checks.length} checks passed`);

  if (passed === checks.length) {
    console.log('   🎉 System is HEALTHY!');
    process.exit(0);
  } else if (passed >= 3) {
    console.log('   ⚠️ System is PARTIALLY working');
    process.exit(0);
  } else {
    console.log('   ❌ System has ISSUES');
    process.exit(1);
  }
}

healthCheck().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
