# Screenshot Storage Locations

## Primary Screenshot Directory
**Location**: `C:\Users\harwu\OneDrive\Documents\Sunlogin Files`

- **Purpose**: Default location for Sunlogin remote desktop screenshots
- **File Types**: PNG, JPG images
- **Usage**: Medical documents, X-rays, patient forms captured via remote access

## Integration with Medical System

### For OCR Processing
Screenshots from Sunlogin can be processed through the MonkeyOCR service:

1. **Manual Upload**: Upload screenshots via patient file upload interface
2. **Batch Processing**: Point OCR service to screenshot directory
3. **Automatic Processing**: Monitor directory for new screenshots

### Directory Structure Recommendation
```
C:\Users\harwu\OneDrive\Documents\Sunlogin Files\
├── medical-forms/          # Medical intake forms
├── xrays/                 # X-ray images
├── lab-results/           # Laboratory reports
├── prescriptions/         # Prescription documents
└── processed/             # OCR-processed files
```

### OCR Integration Command
```bash
# Process all screenshots in Sunlogin directory
python ocr-service/parse.py "C:\Users\harwu\OneDrive\Documents\Sunlogin Files" -t text

# Process specific medical form
python ocr-service/parse.py "C:\Users\harwu\OneDrive\Documents\Sunlogin Files\medical-forms\patient-form.png"
```

## Security Considerations

- **OneDrive Sync**: Files automatically backed up to cloud
- **Access Control**: Ensure proper permissions for medical data
- **Privacy**: Consider local-only storage for sensitive medical documents
- **HIPAA Compliance**: Review OneDrive policies for medical data storage

## Notes

- **Date Created**: 2024-09-26
- **Purpose**: Track screenshot locations for OCR integration
- **Update Frequency**: As needed when directories change