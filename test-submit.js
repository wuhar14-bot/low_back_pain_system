import { chromium } from 'playwright';

(async () => {
  console.log('🚀 Starting Playwright test...');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 300
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });

  // Listen for network responses
  page.on('response', response => {
    if (response.status() >= 400) {
      console.log(`❌ HTTP ${response.status()}: ${response.url()}`);
    }
  });

  try {
    console.log('📍 Navigating to site...');
    await page.goto('https://low-back-pain-system.onrender.com', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    console.log('✅ Page loaded, waiting for React app to render...');
    await page.waitForTimeout(5000);

    // Take screenshot to see current state (Dashboard)
    await page.screenshot({ path: 'E:\\claude-code\\low back pain system\\1-dashboard.png', fullPage: true });
    console.log('📸 Dashboard screenshot saved');

    // Click on "患者数据收集" card to enter the form page
    console.log('📍 Clicking "患者数据收集" card...');
    await page.click('text=患者数据收集');
    await page.waitForTimeout(3000);

    await page.screenshot({ path: 'E:\\claude-code\\low back pain system\\2-welcome.png', fullPage: true });
    console.log('📸 Welcome page screenshot saved');

    // Now click "开始数据收集" button on the welcome page
    console.log('📍 Clicking "开始数据收集" button...');
    await page.click('text=开始数据收集', { timeout: 10000 });
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'E:\\claude-code\\low back pain system\\2-basic-info.png', fullPage: true });
    console.log('📸 Basic info page screenshot saved');

    // Fill in basic info using placeholders to find the right inputs
    // Patient name is now optional, skip it to test the fix
    console.log('📍 Skipping Patient Name (testing optional field)...');

    console.log('📍 Filling Study ID...');
    // Study ID input has placeholder containing "Study ID"
    await page.fill('input[placeholder*="Study"]', 'TEST-' + Date.now());
    console.log('✅ Study ID filled');
    await page.waitForTimeout(500);

    // Fill age - input with placeholder containing "年龄"
    console.log('📍 Filling Age...');
    await page.fill('input[placeholder*="年龄"]', '35');
    console.log('✅ Age filled');
    await page.waitForTimeout(500);

    // Select gender - click the circle/radio for 男
    console.log('📍 Selecting Gender...');
    // The gender selector uses circles, click on the one next to 男
    const genderSection = await page.$('text=性别');
    if (genderSection) {
      // Click the 男 option
      await page.click('text=男 >> nth=0');
    }
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'E:\\claude-code\\low back pain system\\3-filled-basic.png', fullPage: true });
    console.log('📸 Filled basic info screenshot saved');

    // Click next twice to get to pain area section
    console.log('📍 Clicking "下一步" to Medical History...');
    await page.click('text=下一步');
    await page.waitForTimeout(1000);

    console.log('📍 Clicking "下一步" to Pain Areas...');
    await page.click('text=下一步');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'E:\\claude-code\\low back pain system\\4-pain-areas.png', fullPage: true });
    console.log('📸 Pain areas page screenshot saved');

    // Click on some pain areas
    console.log('📍 Selecting pain areas...');
    const paths = await page.$$('svg path');
    console.log(`Found ${paths.length} SVG paths`);

    if (paths.length > 10) {
      // Click on a few pain areas
      await paths[15].click(); // lower back area roughly
      await page.waitForTimeout(300);
      await paths[16].click();
      await page.waitForTimeout(300);
      console.log('✅ Clicked pain areas');
    }

    await page.screenshot({ path: 'E:\\claude-code\\low back pain system\\5-selected-areas.png', fullPage: true });

    // Go to catalog to submit
    console.log('📍 Opening catalog...');
    await page.click('text=目录');
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'E:\\claude-code\\low back pain system\\6-catalog.png', fullPage: true });

    // Click submit - the button says "提交患者信息"
    console.log('📍 Clicking submit...');
    await page.click('text=提交患者信息');

    // Wait for response
    console.log('📍 Waiting for response...');
    await page.waitForTimeout(8000);

    await page.screenshot({ path: 'E:\\claude-code\\low back pain system\\7-result.png', fullPage: true });

    // Check for success or error
    const pageContent = await page.textContent('body');
    if (pageContent.includes('提交成功') || pageContent.includes('更新成功')) {
      console.log('🎉 SUCCESS! Patient data submitted successfully!');
    } else if (pageContent.includes('提交失败')) {
      console.log('❌ FAILED! Submission error occurred.');
    } else {
      console.log('⚠️ Unknown result state');
    }

    // Keep browser open for inspection
    console.log('🔍 Keeping browser open for 20 seconds for inspection...');
    await page.waitForTimeout(20000);

  } catch (error) {
    console.error('❌ Test error:', error.message);
    await page.screenshot({ path: 'E:\\claude-code\\low back pain system\\error-screenshot.png', fullPage: true });
    console.log('📸 Error screenshot saved');

    // Keep open to see error
    await page.waitForTimeout(10000);
  } finally {
    await browser.close();
    console.log('🏁 Test completed');
  }
})();
