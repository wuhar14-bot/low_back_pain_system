import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  try {
    // 测试外部参数传递
    const testUrl = 'http://localhost:5173?workspace=ws-001&workspaceName=HKU%20Orthopedics&doctor=doc-001&doctorName=Dr.%20Hao%20Wu&token=test123';
    await page.goto(testUrl, { waitUntil: 'networkidle', timeout: 30000 });

    // 模拟登录
    await page.fill('input[type="email"]', 'kafwu@connect.hku.hk');
    await page.fill('input[type="password"]', '2749');
    await page.click('button:has-text("Sign In")');

    // 等待登录后页面加载
    await page.waitForTimeout(2000);

    // 导航到 Dashboard 查看侧边栏
    await page.goto('http://localhost:5173/dashboard?workspace=ws-001&workspaceName=HKU%20Orthopedics&doctor=doc-001&doctorName=Dr.%20Hao%20Wu&token=test123', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);

    // 尝试展开侧边栏（如果存在触发按钮）
    try {
      const sidebarTrigger = await page.$('button[data-sidebar-trigger]');
      if (sidebarTrigger) {
        await sidebarTrigger.click();
        await page.waitForTimeout(500);
      }
    } catch (e) {
      console.log('Sidebar already expanded or no trigger found');
    }

    // Take screenshot
    await page.screenshot({ path: 'screenshot.png', fullPage: true });
    console.log('Screenshot saved to screenshot.png');

    // Get page content
    const html = await page.content();
    fs.writeFileSync('page-content.html', html);

    // Get text content
    const text = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync('page-text.txt', text);

    // Get current URL
    console.log('Current URL:', page.url());

    // 检查 localStorage
    const localStorage = await page.evaluate(() => {
      return {
        workspaceId: localStorage.getItem('currentWorkspaceId'),
        workspaceName: localStorage.getItem('currentWorkspaceName'),
        doctorId: localStorage.getItem('currentDoctorId'),
        doctorName: localStorage.getItem('currentDoctorName'),
        authToken: localStorage.getItem('external_auth_token')
      };
    });

    console.log('\n=== LocalStorage External Data ===');
    console.log(JSON.stringify(localStorage, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
})();
