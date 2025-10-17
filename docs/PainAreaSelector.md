# Pain Area Selector - Implementation Documentation

## Overview
The Pain Area Selector is now the **first step** in the data collection process for the low back pain system. It provides an anatomical posterior view with clickable muscle regions based on the reference prototype images.

## Key Features

### 1. Anatomical Posterior View
- SVG-based human body diagram showing posterior (back) view
- Anatomically accurate muscle group regions
- Based on the prototype images: `all grey.png` and `pain areas selected.png`

### 2. Interactive Selection
- **Initial State**: All muscle regions appear in grey (no pain)
- **Click to Select**: Clicking a region turns it red (indicates pain)
- **Click to Deselect**: Clicking again returns it to grey (removes pain marker)
- **Hover Effect**: Visual feedback when hovering over regions

### 3. Selectable Muscle Groups (18 regions)

#### Cervical/Neck Region
- Upper Cervical (上颈椎)
- Lower Cervical (下颈椎)

#### Upper Back/Trapezius
- Left Upper Trapezius (左上斜方肌)
- Right Upper Trapezius (右上斜方肌)
- Left Middle Trapezius (左中斜方肌)
- Right Middle Trapezius (右中斜方肌)
- Left Lower Trapezius (左下斜方肌)
- Right Lower Trapezius (右下斜方肌)

#### Mid Back
- Left Latissimus Dorsi (左背阔肌)
- Right Latissimus Dorsi (右背阔肌)
- Thoracic Erector Spinae (胸椎竖脊肌)

#### Lower Back
- Lumbar Erector Spinae (腰椎竖脊肌)

#### Gluteal Region
- Left Gluteus Maximus (左臀大肌)
- Right Gluteus Maximus (右臀大肌)
- Left Gluteus Medius (左臀中肌)
- Right Gluteus Medius (右臀中肌)

#### Lower Extremity
- Left Hamstring (左腘绳肌)
- Right Hamstring (右腘绳肌)
- Left Gastrocnemius (左腓肠肌)
- Right Gastrocnemius (右腓肠肌)

### 4. Action Buttons

#### Clear Selection Button
- Icon: Rotate counter-clockwise icon
- Color: Blue outline
- Function: Clears all selected pain areas at once
- State: Disabled when no areas are selected

#### Confirm Areas Button
- Icon: Check circle icon
- Color: Green solid
- Function: Confirms the selected pain areas with an alert
- State: Disabled when no areas are selected

### 5. Visual Feedback

#### Selection Counter
- Badge showing number of selected areas
- Updates in real-time as selections change
- Example: "已选择 5 个区域" (5 areas selected)

#### Selected Areas List
- Displays all selected areas as removable tags
- Click tag to deselect that specific area
- Tags shown in red (destructive variant)
- Tooltip: "点击标签可取消选择"

#### Color Legend
- Red: Selected pain area
- Grey: Normal/no pain
- Light grey: No pain background

## Data Structure

### Form Data Storage
```javascript
{
  pain_areas: {
    'upper_cervical': false,
    'lower_cervical': true,
    'left_upper_trap': true,
    'right_upper_trap': false,
    'lumbar_erector': true,
    // ... other regions
  }
}
```

### Section Completion Logic
- Section is marked as completed when at least one pain area is selected
- Validation: `Object.values(formData.pain_areas).some(Boolean)`

## Integration

### Position in Data Collection Flow
1. **Pain Area Selection** ← NEW FIRST STEP
2. Basic Information
3. Medical History
4. Subjective Examination
5. Objective Examination
6. Functional Scoring
7. Intervention Recommendations

### Component Structure
```
PatientForm.jsx
  ├── PainAreaSection.jsx (Step 1)
  ├── BasicInfoSection.jsx (Step 2)
  ├── MedicalHistorySection.jsx (Step 3)
  ├── SubjectiveExamSection.jsx (Step 4)
  ├── ObjectiveExamSection.jsx (Step 5)
  ├── FunctionalScoreSection.jsx (Step 6)
  └── InterventionSection.jsx (Step 7)
```

### Required Field
- Pain Area Selection is marked as **required: true**
- Must be completed before submission
- Included in validation logic

## User Workflow

1. **Start Data Collection**: User clicks "开始数据收集"
2. **Pain Area Selection Screen**: First screen shows anatomical diagram
3. **Read Instructions**: Blue instruction box explains the interface
4. **Select Areas**: Doctor clicks on muscle regions based on patient description
5. **Visual Confirmation**: Selected areas turn red, counter updates
6. **Review Selection**: Check selected areas list below diagram
7. **Clear if Needed**: Use "清除选择" button to start over
8. **Confirm**: Click "确认区域" to validate selection
9. **Proceed**: Click "下一步" to move to basic information section

## Design Specifications

### SVG Diagram
- Width: 285px
- Height: 450px
- ViewBox: 0 0 285 450
- Background: White
- Border: Slate-200 rounded

### Color Scheme
- Selected: #EF4444 (Red-500) with #DC2626 border (Red-600)
- Unselected: #E5E5E5 (Grey-200) with #9CA3AF border (Grey-400)
- Head: #D4A574 (Brown skin tone)
- Hover: 80% opacity

### Responsive Design
- Mobile-friendly layout
- Touch-friendly click targets
- Scrollable on small screens
- Centered alignment

## Technical Notes

### Component File
- Location: `src/components/patient-form/PainAreaSection.jsx`
- Type: React Functional Component
- Props: `formData`, `updateFormData`

### Dependencies
- React
- @/components/ui/card
- @/components/ui/button
- @/components/ui/badge
- lucide-react icons

### State Management
- Pain areas stored in form state as object with boolean values
- Auto-save triggered on each selection change
- Real-time sync with backend

## Comparison with Old Design

### Previous Implementation
- Generic body silhouette with dot markers
- Simple front/back view
- Limited anatomical detail
- Part of subjective examination section

### New Implementation
- Detailed anatomical muscle groups
- Posterior view matching clinical assessment
- Clickable muscle regions
- Dedicated first-step section
- Based on professional medical prototype

## Benefits

1. **Clinical Accuracy**: Matches standard anatomical assessment
2. **First Contact**: Captures pain location immediately
3. **Visual Communication**: Clear representation for doctor-patient discussion
4. **Data Quality**: Precise muscle-level pain mapping
5. **Workflow Efficiency**: Quick selection process
6. **Professional Design**: Based on medical prototype images

## Testing

### Development Server
- URL: http://localhost:5174/
- Environment: Vite React development server
- Hot reload: Enabled

### Test Cases
1. Select single muscle region → Verify red color change
2. Select multiple regions → Verify counter updates
3. Deselect region → Verify grey color return
4. Click tag to remove → Verify deselection
5. Clear all → Verify all regions return to grey
6. Confirm with no selection → Verify alert
7. Confirm with selections → Verify success message
8. Navigate to next step → Verify data persistence

## Future Enhancements

Potential improvements:
- Add anterior (front) view for comprehensive body mapping
- Include pain intensity levels (not just binary selection)
- Add free-text notes for each selected region
- Export pain map as visual report
- Compare pain maps over time for progress tracking