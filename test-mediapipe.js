import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const FRONTEND_URL = 'https://low-back-pain-system.onrender.com';
const TEST_IMAGES = {
  upright: 'E:\\claude-code\\low back pain system\\_archive\\test-data\\test_1_upright.png',
  bend: 'E:\\claude-code\\low back pain system\\_archive\\test-data\\test_1_bend.png'
};

async function testMediaPipe() {
  console.log('🧪 MediaPipe Integration Test');
  console.log('=' .repeat(50));
  console.log(`📅 ${new Date().toISOString()}\n`);

  // Verify test images exist
  console.log('1️⃣ Checking test images...');
  for (const [name, imgPath] of Object.entries(TEST_IMAGES)) {
    if (fs.existsSync(imgPath)) {
      console.log(`   ✅ ${name}: ${imgPath}`);
    } else {
      console.log(`   ❌ ${name}: NOT FOUND - ${imgPath}`);
      process.exit(1);
    }
  }

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  // Listen for console messages and network errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text().substring(0, 200));
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (response.status() >= 400 && (url.includes('mediapipe') || url.includes('pose'))) {
      console.log(`❌ HTTP ${response.status()}: ${url}`);
    }
  });

  try {
    console.log('\n2️⃣ Loading frontend...');
    await page.goto(FRONTEND_URL, {
      waitUntil: 'networkidle',
      timeout: 60000
    });
    console.log('   ✅ Frontend loaded');

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'mediapipe-test-1-dashboard.png', fullPage: true });

    // Click patient data collection
    console.log('\n3️⃣ Navigating to patient form...');
    await page.click('text=患者数据收集');
    await page.waitForTimeout(2000);

    // Click start data collection
    await page.click('text=开始数据收集');
    await page.waitForTimeout(2000);

    // Fill basic info
    console.log('   📝 Filling basic patient info...');
    await page.fill('input[placeholder*="Study"]', 'MEDIAPIPE-TEST-' + Date.now());
    await page.fill('input[placeholder*="年龄"]', '30');
    await page.click('text=男 >> nth=0');
    await page.waitForTimeout(500);

    // Navigate to step 5 (客观检查) where posture analysis is
    console.log('\n4️⃣ Navigating to Objective Exam section (Step 5)...');

    // Click 目录 (catalog) to see all sections
    await page.click('text=目录');
    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'mediapipe-test-catalog.png', fullPage: true });

    // Click on 客观检查 (Objective Exam - step 5)
    const step5 = await page.$('text=客观检查');
    if (step5) {
      console.log('   📍 Found 客观检查 section');
      await step5.click();
      await page.waitForTimeout(2000);
    } else {
      // Try navigating step by step
      for (let i = 0; i < 4; i++) {
        const nextBtn = await page.$('text=下一步');
        if (nextBtn) {
          await nextBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    }

    await page.screenshot({ path: 'mediapipe-test-step5.png', fullPage: true });
    console.log('   ✅ At Objective Exam section')

    // Look for posture analysis trigger
    console.log('\n5️⃣ Attempting to open Posture Analysis modal...');

    // The button says "开始姿态分析" (Start Posture Analysis)
    const postureTriggers = [
      'text=开始姿态分析',
      'button:has-text("开始姿态分析")',
      'button:has-text("姿态分析")',
      'button.bg-gradient-to-r'
    ];

    let modalOpened = false;
    for (const selector of postureTriggers) {
      try {
        const btn = await page.$(selector);
        if (btn) {
          console.log(`   📍 Clicking: ${selector}`);
          await btn.click();
          await page.waitForTimeout(3000);

          // Check if modal opened - look for dialog or the modal content
          const modal = await page.$('[role="dialog"], .fixed.inset-0, [data-state="open"]');
          if (modal) {
            console.log('   ✅ Modal opened!');
            modalOpened = true;
            break;
          }

          // Also check if we see upload UI
          const uploadArea = await page.$('text=上传图片');
          const uploadArea2 = await page.$('text=拖拽');
          if (uploadArea || uploadArea2) {
            console.log('   ✅ Upload UI visible!');
            modalOpened = true;
            break;
          }
        }
      } catch (e) {
        console.log(`   ⚠️ Error with ${selector}: ${e.message}`);
      }
    }

    await page.screenshot({ path: 'mediapipe-test-2-modal.png', fullPage: true });

    if (modalOpened) {
      console.log('\n6️⃣ Uploading test images...');

      // Look for file inputs
      const fileInputs = await page.$$('input[type="file"]');
      console.log(`   Found ${fileInputs.length} file input(s)`);

      if (fileInputs.length >= 2) {
        // Upload upright image
        console.log('   📤 Uploading upright pose image...');
        await fileInputs[0].setInputFiles(TEST_IMAGES.upright);
        await page.waitForTimeout(1000);

        // Upload bent image
        console.log('   📤 Uploading flexion pose image...');
        await fileInputs[1].setInputFiles(TEST_IMAGES.bend);
        await page.waitForTimeout(1000);

        await page.screenshot({ path: 'mediapipe-test-3-images-uploaded.png', fullPage: true });

        // Click analyze button - use force:true to bypass overlay
        console.log('\n7️⃣ Starting pose analysis...');
        const analyzeButtons = [
          'text=开始分析',
          'text=分析姿势',
          'text=Analyze',
          'button:has-text("分析")'
        ];

        for (const selector of analyzeButtons) {
          try {
            const btn = await page.$(selector);
            if (btn) {
              console.log(`   📍 Clicking: ${selector}`);
              await btn.click({ force: true, timeout: 5000 });
              break;
            }
          } catch (e) {
            console.log(`   ⚠️ Click failed: ${e.message.substring(0, 50)}`);
          }
        }

        // Wait for analysis to complete
        console.log('   ⏳ Waiting for MediaPipe analysis (up to 30s)...');
        await page.waitForTimeout(30000);

        await page.screenshot({ path: 'mediapipe-test-4-result.png', fullPage: true });

        // Check for results
        const pageContent = await page.textContent('body');
        if (pageContent.includes('分析完成') || pageContent.includes('角度') || pageContent.includes('ROM')) {
          console.log('   🎉 MediaPipe analysis completed successfully!');
        } else if (pageContent.includes('失败') || pageContent.includes('error')) {
          console.log('   ❌ Analysis failed - check screenshot');
        } else {
          console.log('   ⚠️ Unknown result state - check screenshot');
        }
      } else {
        console.log('   ⚠️ Could not find 2 file inputs for image upload');
      }
    } else {
      console.log('   ⚠️ Could not open posture analysis modal');
      console.log('   📸 Check mediapipe-test-2-modal.png for current state');
    }

    // Keep browser open for inspection
    console.log('\n🔍 Browser stays open for 30 seconds for inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    await page.screenshot({ path: 'mediapipe-test-error.png', fullPage: true });
    console.log('📸 Error screenshot saved');
    await page.waitForTimeout(10000);
  } finally {
    await browser.close();
    console.log('\n🏁 Test completed');
  }
}

testMediaPipe().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
