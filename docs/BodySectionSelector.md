# Body Section Selector Component

## Overview
The `BodySectionSelector` component provides an interactive human body diagram that allows doctors to select areas of discomfort based on patient descriptions during data collection in the low back pain system.

## Features

### Interactive Body Diagram
- **Visual Representation**: Anatomically-styled human body silhouette with clickable regions
- **Color-coded Selection**: Red dots indicate selected areas of discomfort
- **Hover Effects**: Visual feedback when hovering over selectable areas
- **Responsive Design**: Optimized for both desktop and mobile devices

### Selectable Body Regions
The component supports selection of 18 different body regions:

#### Spine Regions
- 颈椎（左/右） - Cervical spine (left/right)
- 胸椎（中间/左/右） - Thoracic spine (center/left/right)
- 腰椎（中间/左/右） - Lumbar spine (center/left/right)

#### Lower Body Regions
- 臀部（左/右） - Hip (left/right)
- 大腿（左/右） - Thigh (left/right)
- 膝盖（左/右） - Knee (left/right)
- 小腿（左/右） - Calf (left/right)
- 足部（左/右） - Foot (left/right)

### User Interface Elements
- **Selection Counter**: Badge showing number of selected regions
- **Selected Areas List**: Tags displaying chosen regions with removal option
- **Instructions**: Clear guidance on how to use the selector
- **Visual Feedback**: Immediate response to user interactions

## Integration

### Usage in SubjectiveExamSection
The component is integrated into the `SubjectiveExamSection` as the first element, allowing doctors to capture discomfort areas before proceeding with pain scoring and other assessments.

```jsx
import BodySectionSelector from "./BodySectionSelector";

// In component:
<BodySectionSelector formData={formData} updateFormData={updateFormData} />
```

### Data Structure
Selected areas are stored in the form data as:
```javascript
{
  discomfort_areas: {
    'cervical_left': true,
    'lumbar_center': true,
    'hip_right': true,
    // ... other selected regions
  }
}
```

## User Workflow

1. **Initial State**: Empty body diagram with clickable regions
2. **Selection**: Doctor clicks on body regions described by patient
3. **Visual Feedback**: Selected areas appear as red dots
4. **Review**: Selected areas are listed as removable tags below the diagram
5. **Modification**: Areas can be deselected by clicking the dot again or the tag
6. **Continuation**: Doctor proceeds with other examination data

## Technical Implementation

### Component Props
- `formData`: Current form state object
- `updateFormData`: Function to update form state

### Styling
- Tailwind CSS for responsive design
- Color scheme: slate grays for body, red for selected areas
- Gradient background for visual appeal
- Shadow effects for depth

### Accessibility
- Semantic HTML structure
- Keyboard navigation support
- Screen reader compatible labels
- High contrast selection indicators

## Benefits

1. **Intuitive Interface**: Visual body representation is immediately understandable
2. **Accurate Data Capture**: Precise anatomical region identification
3. **Efficient Workflow**: Quick selection process speeds up data entry
4. **Reduced Errors**: Visual confirmation prevents misidentification
5. **Patient Communication**: Clear representation aids doctor-patient discussion

## Based on Reference Design
The component is inspired by the mobile interface shown in the reference image, adapted for web-based clinical data collection with enhanced functionality and accessibility features.