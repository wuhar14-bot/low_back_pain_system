"""
HTML to PDF Converter using pdfkit/wkhtmltopdf
Generates high-quality PDF from architecture report HTML
"""

import os
import sys

def generate_pdf():
    print("Starting PDF generation with Python...")

    script_dir = os.path.dirname(os.path.abspath(__file__))
    html_path = os.path.join(script_dir, '../docs/reports/architecture_report.html')
    pdf_path = os.path.join(script_dir, '../docs/reports/architecture_report_python.pdf')

    # Check if HTML file exists
    if not os.path.exists(html_path):
        print(f"ERROR: HTML file not found: {html_path}")
        sys.exit(1)

    print(f"Input HTML: {html_path}")
    print(f"Output PDF: {pdf_path}")

    try:
        # Try pdfkit first (requires wkhtmltopdf)
        import pdfkit

        options = {
            'page-size': 'A4',
            'margin-top': '20mm',
            'margin-right': '15mm',
            'margin-bottom': '20mm',
            'margin-left': '15mm',
            'encoding': 'UTF-8',
            'enable-local-file-access': None,
            'print-media-type': None,
            'no-outline': None
        }

        pdfkit.from_file(html_path, pdf_path, options=options)

        file_size_kb = os.path.getsize(pdf_path) / 1024
        print(f"SUCCESS: PDF generated with pdfkit!")
        print(f"Location: {pdf_path}")
        print(f"File size: {file_size_kb:.2f} KB")

    except ImportError:
        print("WARNING: pdfkit not installed. Trying alternative method...")

        try:
            # Alternative: xhtml2pdf
            from xhtml2pdf import pisa

            with open(html_path, 'r', encoding='utf-8') as html_file:
                html_content = html_file.read()

            with open(pdf_path, 'wb') as pdf_file:
                pisa_status = pisa.CreatePDF(html_content, dest=pdf_file)

            if pisa_status.err:
                print(f"ERROR creating PDF: {pisa_status.err}")
                sys.exit(1)

            file_size_kb = os.path.getsize(pdf_path) / 1024
            print(f"SUCCESS: PDF generated with xhtml2pdf!")
            print(f"Location: {pdf_path}")
            print(f"File size: {file_size_kb:.2f} KB")

        except ImportError:
            print("\nERROR: No PDF generation library found!")
            print("\nInstall one of the following:")
            print("   Option 1: pip install pdfkit  (+ wkhtmltopdf binary)")
            print("   Option 2: pip install xhtml2pdf")
            sys.exit(1)

    except Exception as e:
        print(f"ERROR generating PDF: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == '__main__':
    generate_pdf()
