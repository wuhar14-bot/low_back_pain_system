const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new'
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  // 访问本地开发服务器
  await page.goto('http://localhost:5173', {
    waitUntil: 'networkidle0',
    timeout: 30000
  });

  // 截图
  await page.screenshot({
    path: 'screenshot.png',
    fullPage: true
  });

  console.log('Screenshot saved to screenshot.png');

  await browser.close();
})();
