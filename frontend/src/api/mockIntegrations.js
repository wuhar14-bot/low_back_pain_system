// Mock integrations for local development to bypass authentication issues

// isDevelopment will be passed from integrations.js

// Mock UploadFile function
export const mockUploadFile = async ({ file }) => {
  // Processing file upload

  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return mock file URL
  return {
    file_url: `https://mock-storage.example.com/files/${Date.now()}_${file.name}`,
    file_id: `mock_${Date.now()}`,
    success: true
  };
};

// Mock InvokeLLM function
export const mockInvokeLLM = async ({ prompt, images = [], model = "gpt-4o" }) => {
  // Processing AI analysis

  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Return mock medical data extraction
  const mockMedicalData = {
    // 基本信息
    name: "张三",
    age: 45,
    gender: "男",
    phone: "138****1234",

    // 主诉
    chief_complaint: "腰痛伴左下肢放射痛3个月",
    pain_location: "腰4-5椎间盘",
    pain_nature: "钝痛，间歇性加重",
    pain_duration: "3个月",

    // 疼痛评分
    pain_score: 7,
    pain_triggers: ["久坐", "弯腰", "咳嗽时加重"],
    pain_relief: ["休息", "平卧位"],

    // 病史
    history_present: "患者3个月前无明显诱因出现腰痛，伴左下肢放射痛",
    history_past: "既往体健，无腰椎手术史",

    // 体格检查
    physical_exam: {
      posture: "腰椎生理弯曲变直",
      range_of_motion: "腰椎前屈受限",
      straight_leg_raise: "左侧直腿抬高试验阳性(45°)",
      neurological: "左下肢感觉减退"
    },

    // 辅助检查
    imaging: "腰椎MRI示：L4-5椎间盘突出",

    // 诊断
    diagnosis: "腰4-5椎间盘突出症",

    // 治疗建议
    treatment_plan: ["保守治疗", "理疗", "药物治疗", "功能锻炼"],
    medications: [
      {
        name: "塞来昔布胶囊",
        dosage: "200mg",
        frequency: "每日2次",
        duration: "2周"
      },
      {
        name: "甲钴胺片",
        dosage: "0.5mg",
        frequency: "每日3次",
        duration: "4周"
      }
    ]
  };

  return {
    response: JSON.stringify(mockMedicalData, null, 2),
    success: true,
    model_used: model,
    tokens_used: 1250
  };
};

// Mock posture analysis
export const mockPostureAnalysis = async () => {
  // Processing posture analysis

  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    success: true,
    analysis: {
      overall_score: 72,
      posture_type: "前倾型",
      findings: [
        "头部前倾15°",
        "肩部高低不一致",
        "骨盆前倾8°",
        "腰椎曲度减小"
      ],
      recommendations: [
        "加强颈部后伸肌群训练",
        "改善工作姿势",
        "进行骨盆矫正训练",
        "加强核心肌群稳定性"
      ],
      standing_keypoints: {
        shoulder: { x: 320, y: 150 },
        hip: { x: 325, y: 280 },
        knee: { x: 330, y: 420 },
        ankle: { x: 335, y: 520 }
      },
      flexion_keypoints: {
        shoulder: { x: 280, y: 180 },
        hip: { x: 320, y: 300 },
        knee: { x: 350, y: 380 },
        ankle: { x: 380, y: 500 }
      }
    }
  };
};

// Create mock versions of the API functions
export const createMockIntegrations = (originalIntegrations, isDevelopment = false) => {
  if (!isDevelopment) {
    // Hybrid mode: Use real InvokeLLM for OCR, mock for others
    return {
      ...originalIntegrations,
      UploadFile: mockUploadFile,
      InvokeLLM: originalIntegrations.InvokeLLM, // Use real OCR
      SendEmail: mockSendEmail,
      GenerateImage: mockGenerateImage,
      ExtractDataFromUploadedFile: mockExtractDataFromUploadedFile,
      CreateFileSignedUrl: mockCreateFileSignedUrl,
      UploadPrivateFile: mockUploadPrivateFile,
      Core: {
        ...originalIntegrations.Core,
        UploadFile: mockUploadFile,
        InvokeLLM: originalIntegrations.Core.InvokeLLM, // Use real OCR
        SendEmail: mockSendEmail,
        GenerateImage: mockGenerateImage,
        ExtractDataFromUploadedFile: mockExtractDataFromUploadedFile,
        CreateFileSignedUrl: mockCreateFileSignedUrl,
        UploadPrivateFile: mockUploadPrivateFile
      }
    };
  }

  // Using mock integrations silently

  return {
    ...originalIntegrations,
    UploadFile: mockUploadFile,
    InvokeLLM: mockInvokeLLM,
    SendEmail: mockSendEmail,
    GenerateImage: mockGenerateImage,
    ExtractDataFromUploadedFile: mockExtractDataFromUploadedFile,
    CreateFileSignedUrl: mockCreateFileSignedUrl,
    UploadPrivateFile: mockUploadPrivateFile,
    Core: {
      ...originalIntegrations.Core,
      UploadFile: mockUploadFile,
      InvokeLLM: mockInvokeLLM,
      SendEmail: mockSendEmail,
      GenerateImage: mockGenerateImage,
      ExtractDataFromUploadedFile: mockExtractDataFromUploadedFile,
      CreateFileSignedUrl: mockCreateFileSignedUrl,
      UploadPrivateFile: mockUploadPrivateFile
    }
  };
};

// Mock SendEmail function
export const mockSendEmail = async ({ to, subject, htmlContent }) => {
  console.log('🔧 Mock: SendEmail called', { to, subject });

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    success: true,
    messageId: `mock_email_${Date.now()}`,
    status: 'sent'
  };
};

// Mock GenerateImage function
export const mockGenerateImage = async ({ prompt, size = "1024x1024" }) => {
  console.log('🔧 Mock: GenerateImage called with prompt:', prompt);

  // Simulate image generation delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    success: true,
    image_url: `https://mock-ai-images.example.com/generated/${Date.now()}.jpg`,
    revised_prompt: `Enhanced version: ${prompt}`,
    size: size
  };
};

// Mock ExtractDataFromUploadedFile function
export const mockExtractDataFromUploadedFile = async ({ fileId, extractionType = "text" }) => {
  console.log('🔧 Mock: ExtractDataFromUploadedFile called', { fileId, extractionType });

  // Simulate OCR/extraction delay
  await new Promise(resolve => setTimeout(resolve, 1200));

  return {
    success: true,
    extracted_text: "这是从图片中提取的示例文本内容。包含患者姓名：张三，年龄：45岁，主诉：腰痛3个月。",
    confidence_score: 0.95,
    extraction_type: extractionType
  };
};

// Mock CreateFileSignedUrl function
export const mockCreateFileSignedUrl = async ({ fileName, contentType, isPrivate = false }) => {
  console.log('🔧 Mock: CreateFileSignedUrl called', { fileName, contentType, isPrivate });

  // Simulate signed URL generation delay
  await new Promise(resolve => setTimeout(resolve, 300));

  return {
    success: true,
    signedUrl: `https://mock-storage.example.com/upload/${Date.now()}_${fileName}?signature=mock_signature`,
    fileId: `mock_file_${Date.now()}`,
    expiresIn: 3600
  };
};

// Mock UploadPrivateFile function
export const mockUploadPrivateFile = async ({ file, folder = "private" }) => {
  console.log('🔧 Mock: UploadPrivateFile called', { fileName: file.name, folder });

  // Simulate private file upload delay
  await new Promise(resolve => setTimeout(resolve, 800));

  return {
    success: true,
    fileId: `private_${Date.now()}`,
    filePath: `${folder}/${Date.now()}_${file.name}`,
    fileUrl: `https://mock-private-storage.example.com/${folder}/${Date.now()}_${file.name}`,
    size: file.size
  };
};

export {
  mockUploadFile as UploadFile,
  mockInvokeLLM as InvokeLLM,
  mockSendEmail as SendEmail,
  mockGenerateImage as GenerateImage,
  mockExtractDataFromUploadedFile as ExtractDataFromUploadedFile,
  mockCreateFileSignedUrl as CreateFileSignedUrl,
  mockUploadPrivateFile as UploadPrivateFile
};