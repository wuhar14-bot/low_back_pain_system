/**
 * HTML to PDF Converter using Puppeteer
 * Generates high-quality PDF from architecture report HTML
 */

import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generatePDF() {
    console.log('🚀 Starting PDF generation with Puppeteer...');

    const htmlPath = path.join(__dirname, '../docs/reports/architecture_report.html');
    const pdfPath = path.join(__dirname, '../docs/reports/architecture_report_puppeteer.pdf');

    // Check if HTML file exists
    if (!fs.existsSync(htmlPath)) {
        console.error('❌ HTML file not found:', htmlPath);
        process.exit(1);
    }

    console.log('📄 Input HTML:', htmlPath);
    console.log('📑 Output PDF:', pdfPath);

    // Launch browser
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Load HTML file
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
    });

    // Generate PDF with high quality settings
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20mm',
            right: '15mm',
            bottom: '20mm',
            left: '15mm'
        },
        displayHeaderFooter: false,
        preferCSSPageSize: false
    });

    await browser.close();

    console.log('✅ PDF generated successfully with Puppeteer!');
    console.log('📍 Location:', pdfPath);

    // Get file size
    const stats = fs.statSync(pdfPath);
    const fileSizeInKB = (stats.size / 1024).toFixed(2);
    console.log(`📊 File size: ${fileSizeInKB} KB`);
}

// Run the generator
generatePDF().catch(error => {
    console.error('❌ Error generating PDF:', error);
    process.exit(1);
});
