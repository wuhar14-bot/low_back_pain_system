import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ignoreHTTPSErrors: true  // Ignore self-signed certificate warnings
  });
  const page = await context.newPage();

  try {
    console.log('Navigating to Swagger UI...');
    await page.goto('https://localhost:44385/swagger', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for Swagger UI to load
    await page.waitForSelector('.swagger-ui', { timeout: 10000 });
    console.log('Swagger UI loaded!');

    // Take screenshot
    await page.screenshot({
      path: 'E:\\claude-code\\low back pain system\\swagger-ui-screenshot.png',
      fullPage: true
    });
    console.log('Screenshot saved to: swagger-ui-screenshot.png');

    // Get page title
    const title = await page.title();
    console.log('Page title:', title);

    // Get API endpoints
    const endpoints = await page.$$eval('.opblock-summary-path', elements =>
      elements.map(el => el.textContent)
    );
    console.log('\nAPI Endpoints found:');
    endpoints.forEach(ep => console.log('  -', ep));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
  }
})();
