import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, X, ImageIcon, Loader2, CheckCircle, Camera, FileText, RotateCcw, User, Crop } from "lucide-react";
// Removed UploadFile import - using local OCR only
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const drawSkeletonOnImage = (imageSrc, keypoints) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const scaleX = img.naturalWidth / 1920;
      const scaleY = img.naturalHeight / 1080;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      ctx.drawImage(img, 0, 0);

      const connections = [
        ['shoulder', 'hip'],
        ['hip', 'knee'],
        ['knee', 'ankle']
      ];

      const scaledKeypoints = {};
      for(const key in keypoints) {
        if(keypoints[key] && typeof keypoints[key].x === 'number' && typeof keypoints[key].y === 'number') {
            scaledKeypoints[key] = {
                x: keypoints[key].x * scaleX,
                y: keypoints[key].y * scaleY
            };
        }
      }
      
      ctx.strokeStyle = '#34D399';
      ctx.lineWidth = Math.max(4, 4 * scaleX);
      ctx.lineCap = 'round';

      connections.forEach(([p1, p2]) => {
        if (scaledKeypoints[p1] && scaledKeypoints[p2]) {
          ctx.beginPath();
          ctx.moveTo(scaledKeypoints[p1].x, scaledKeypoints[p1].y);
          ctx.lineTo(scaledKeypoints[p2].x, scaledKeypoints[p2].y);
          ctx.stroke();
        }
      });
      
      Object.values(scaledKeypoints).forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, Math.max(6, 6 * scaleX), 0, 2 * Math.PI);
        ctx.fillStyle = '#10B981';
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = Math.max(2, 2 * scaleX);
        ctx.stroke();
      });

      resolve(canvas.toDataURL());
    };
    
    img.onerror = () => reject(new Error("图片加载失败，无法绘制骨架。"));
    img.src = imageSrc;
  });
};

export default function ImageUploadModal({ isOpen, onClose, onDataExtracted }) {
  // 病历截图上传相关状态
  const [uploadedImages, setUploadedImages] = useState([]);
  
  // 姿态分析相关状态
  const [posturePhotos, setPosturePhotos] = useState({
    standing: null,
    flexion: null
  });
  const [postureAnalysisResult, setPostureAnalysisResult] = useState(null);
  
  // 通用状态
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragType, setDragType] = useState(null);

  // 图片裁剪相关状态
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [cropAreas, setCropAreas] = useState([{
    id: 1,
    crop: {
      unit: '%',
      width: 80,
      height: 80,
      x: 10,
      y: 10,
    },
    completedCrop: null
  }]);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  const [cropImageRef, setCropImageRef] = useState(null);
  const [cropType, setCropType] = useState(null); // 'medical' | 'standing' | 'flexion'
  
  // 文件输入引用
  const fileInputRef = useRef(null);
  const standingInputRef = useRef(null);
  const flexionInputRef = useRef(null);
  const cropFileInputRef = useRef(null);
  const postureStandingCropInputRef = useRef(null);
  const postureFlexionCropInputRef = useRef(null);

  // 病历截图上传处理
  const handleFileSelect = async (files) => {
    const fileArray = Array.isArray(files) ? files : Array.from(files);
    const remainingSlots = 5 - uploadedImages.length;
    const filesToProcess = fileArray.slice(0, remainingSlots);

    if (fileArray.length > remainingSlots) {
      alert(`最多只能上传5张图片，已选择前${remainingSlots}张`);
    }

    for (const file of filesToProcess) {
      if (file.type.startsWith('image/')) {
        try {
          setProcessingStep(`处理图片 ${uploadedImages.length + 1}...`);

          // For local OCR, we don't need to upload files - just create preview
          const previewUrl = URL.createObjectURL(file);

          setUploadedImages(prev => [...prev, {
            id: Date.now() + Math.random(),
            file,
            url: previewUrl, // Use preview URL instead of uploaded URL
            name: file.name,
            preview: previewUrl,
          }]);
        } catch (error) {
          console.error("图片处理失败:", error);
          alert(`图片 ${file.name} 处理失败：${error.message || '未知错误'}`);
        }
      } else {
        alert(`文件 ${file.name} 不是图片格式，已跳过`);
      }
    }
    setProcessingStep("");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 姿态分析照片上传处理
  const handlePostureFileSelect = async (file, type) => {
    if (!file || !file.type.startsWith('image/')) {
      alert("请选择图片文件");
      return;
    }

    try {
      setProcessingStep(`正在处理${type === 'standing' ? '站立' : '弯腰'}姿势照片...`);

      // For local processing, we don't need to upload - just create preview
      const previewUrl = URL.createObjectURL(file);

      setPosturePhotos(prev => ({
        ...prev,
        [type]: {
          file,
          url: previewUrl, // Use preview URL instead of uploaded URL
          name: file.name,
          preview: previewUrl
        }
      }));
      
      setProcessingStep("");
    } catch (error) {
      console.error("图片处理失败:", error);
      alert(`图片处理失败：${error.message || '未知错误'}`);
      setProcessingStep("");
    }
  };

  const handleFileInputChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      handleFileSelect(event.target.files);
    }
  };

  const handlePostureFileInputChange = (event, type) => {
    if (event.target.files && event.target.files[0]) {
      handlePostureFileSelect(event.target.files[0], type);
    }
  };

  const handleDrop = (event, uploadType = 'medical') => {
    event.preventDefault();
    setIsDragOver(false);
    setDragType(null);
    
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      if (uploadType === 'medical') {
        handleFileSelect(event.dataTransfer.files);
      }
      event.dataTransfer.clearData();
    }
  };

  const handlePostureDrop = (event, type) => {
    event.preventDefault();
    setIsDragOver(false);
    setDragType(null);
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handlePostureFileSelect(event.dataTransfer.files[0], type);
    }
  };

  const handleDragOver = (event, type = null) => {
    event.preventDefault();
    setIsDragOver(true);
    setDragType(type);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    setDragType(null);
  };

  const removeImage = (imageId) => {
    setUploadedImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const removePosturePhoto = (type) => {
    if (posturePhotos[type]?.preview) {
      URL.revokeObjectURL(posturePhotos[type].preview);
    }
    setPosturePhotos(prev => ({
      ...prev,
      [type]: null
    }));
  };

  // 图片裁剪相关功能
  const openCropModal = (file, type) => {
    if (file && file.type.startsWith('image/')) {
      const imageUrl = URL.createObjectURL(file);
      setImageToCrop({ file, url: imageUrl, originalFile: file });
      setCropType(type);

      // Reset crop areas to single area
      setCropAreas([{
        id: 1,
        crop: {
          unit: '%',
          width: 80,
          height: 80,
          x: 10,
          y: 10,
        },
        completedCrop: null
      }]);
      setCurrentCropIndex(0);
      setCropModalOpen(true);
    } else {
      alert("请选择有效的图片文件");
    }
  };

  const handleCropComplete = (crop) => {
    // Update the completed crop for the current crop area
    setCropAreas(prevAreas =>
      prevAreas.map((area, index) =>
        index === currentCropIndex
          ? { ...area, completedCrop: crop }
          : area
      )
    );
  };

  const handleCropChange = (crop) => {
    // Update the current crop area's crop settings
    setCropAreas(prevAreas =>
      prevAreas.map((area, index) =>
        index === currentCropIndex
          ? { ...area, crop }
          : area
      )
    );
  };

  const addCropArea = () => {
    const newId = Math.max(...cropAreas.map(area => area.id)) + 1;
    setCropAreas(prevAreas => [
      ...prevAreas,
      {
        id: newId,
        crop: {
          unit: '%',
          width: 60,
          height: 60,
          x: 20,
          y: 20,
        },
        completedCrop: null
      }
    ]);
    setCurrentCropIndex(cropAreas.length);
  };

  const removeCropArea = (indexToRemove) => {
    if (cropAreas.length > 1) {
      setCropAreas(prevAreas => prevAreas.filter((_, index) => index !== indexToRemove));
      if (currentCropIndex >= indexToRemove && currentCropIndex > 0) {
        setCurrentCropIndex(currentCropIndex - 1);
      }
    }
  };

  const switchCropArea = (index) => {
    setCurrentCropIndex(index);
  };

  const applyCrop = async () => {
    // Filter only completed crop areas
    const completedAreas = cropAreas.filter(area => area.completedCrop);

    if (completedAreas.length === 0 || !cropImageRef || !imageToCrop) {
      alert("请先至少完成一个裁剪区域");
      return;
    }

    try {
      const image = cropImageRef;
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      // Process all completed crop areas
      const croppedFiles = [];

      for (let i = 0; i < completedAreas.length; i++) {
        const area = completedAreas[i];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = area.completedCrop.width * scaleX;
        canvas.height = area.completedCrop.height * scaleY;

        ctx.drawImage(
          image,
          area.completedCrop.x * scaleX,
          area.completedCrop.y * scaleY,
          area.completedCrop.width * scaleX,
          area.completedCrop.height * scaleY,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Convert canvas to blob and create file
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
        const fileName = completedAreas.length > 1
          ? `cropped_area${i + 1}_${imageToCrop.originalFile.name}`
          : `cropped_${imageToCrop.originalFile.name}`;

        const croppedFile = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });

        croppedFiles.push(croppedFile);
      }

      // Process the cropped images based on type
      if (cropType === 'medical') {
        await handleFileSelect(croppedFiles);

        // Auto-trigger OCR processing immediately after crop
        setCropModalOpen(false);
        setCropType(null);

        // Wait a moment for images to be added to state
        setTimeout(async () => {
          setIsProcessing(true);
          setProcessingStep("OCR正在自动识别图片内容...");

          try {
            // Trigger OCR immediately with the newly cropped images
            await processMedicalImagesImmediately(croppedFiles);
          } catch (error) {
            console.error("自动OCR处理失败:", error);
            alert(`OCR识别失败: ${error.message}`);
          } finally {
            setIsProcessing(false);
            setProcessingStep("");
          }
        }, 500);

      } else if (cropType === 'standing' || cropType === 'flexion') {
        // For posture, only use the first crop area
        await handlePostureFileSelect(croppedFiles[0], cropType);

        // Clean up and close modal for posture
        URL.revokeObjectURL(imageToCrop.url);
        setImageToCrop(null);
        setCropModalOpen(false);
        setCropType(null);
      }

    } catch (error) {
      console.error("裁剪图片失败:", error);
      alert("裁剪图片失败，请重试");
    }
  };

  const cancelCrop = () => {
    if (imageToCrop?.url) {
      URL.revokeObjectURL(imageToCrop.url);
    }
    setImageToCrop(null);
    setCropModalOpen(false);
    setCropType(null);
    // Reset crop areas
    setCropAreas([{
      id: 1,
      crop: {
        unit: '%',
        width: 80,
        height: 80,
        x: 10,
        y: 10,
      },
      completedCrop: null
    }]);
    setCurrentCropIndex(0);
  };

  // 自动上传Sunlogin最新截图功能
  const uploadLatestSunloginScreenshot = async () => {
    const sunloginPath = "C:\\Users\\harwu\\OneDrive\\Documents\\Sunlogin Files";

    try {
      setIsProcessing(true);
      setProcessingStep("正在查找最新的Sunlogin截图...");

      // 使用File System Access API来访问文件夹
      if (!window.showDirectoryPicker) {
        alert("您的浏览器不支持文件夹访问API。请手动选择图片。");
        setIsProcessing(false);
        return;
      }

      // 请求用户授权访问Sunlogin文件夹
      const directoryHandle = await window.showDirectoryPicker({
        id: 'sunlogin-files',
        startIn: 'documents'
      });

      let latestFile = null;
      let latestTime = 0;

      // 遍历文件夹找到最新的图片文件
      for await (const [name, handle] of directoryHandle.entries()) {
        if (handle.kind === 'file') {
          const file = await handle.getFile();
          // 检查是否为图片文件
          if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(name)) {
            if (file.lastModified > latestTime) {
              latestTime = file.lastModified;
              latestFile = file;
            }
          }
        }
      }

      if (!latestFile) {
        alert("在Sunlogin文件夹中未找到图片文件");
        setIsProcessing(false);
        return;
      }

      setProcessingStep(`找到最新截图: ${latestFile.name}`);

      // 直接打开裁剪模态框
      openCropModal(latestFile, 'medical');

    } catch (error) {
      console.error('Auto-upload error:', error);
      if (error.name === 'AbortError') {
        alert("用户取消了文件夹选择");
      } else {
        alert(`获取最新截图失败: ${error.message}`);
      }
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  // 立即处理裁剪后的图片（自动触发）
  const processMedicalImagesImmediately = async (croppedFiles) => {
    setIsProcessing(true);
    setProcessingStep("OCR正在自动识别图片内容...");

    try {
      let allMedicalData = {};

      // Process each cropped image file
      for (let i = 0; i < croppedFiles.length; i++) {
        const file = croppedFiles[i];
        setProcessingStep(`正在识别第${i + 1}张裁剪图片: ${file.name}...`);

        try {
          // Convert file to base64
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.crossOrigin = 'anonymous';

          const imageBase64 = await new Promise((resolve, reject) => {
            img.onload = () => {
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              ctx.drawImage(img, 0, 0);
              const dataURL = canvas.toDataURL('image/jpeg', 0.95);
              resolve(dataURL);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            const objectURL = URL.createObjectURL(file);
            img.src = objectURL;
          });

          // Call OCR service (port 5001)
          const response = await fetch('http://localhost:5001/ocr/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image_base64: imageBase64
            })
          });

          if (!response.ok) {
            throw new Error(`OCR API error: ${response.status}`);
          }

          const result = await response.json();
          console.log('OCR Result:', result); // Debug log

          if (!result.success) {
            throw new Error(result.error || 'OCR processing failed');
          }

          // Extract raw text from OCR result
          const rawText = result.full_text || result.text_lines?.join('\n') || '';
          console.log('========== OCR识别结果 ==========');
          console.log('Raw OCR Text:', rawText);
          console.log('Text Lines:', result.text_lines);
          console.log('================================');

          // Pattern matching to extract medical data from Chinese text
          const medicalData = {};

          // Extract age (年龄: XX or XX岁 or just XX岁)
          const ageMatch = rawText.match(/年龄[：:\s]*(\d+)|(\d+)\s*岁/);
          if (ageMatch) {
            const age = parseInt(ageMatch[1] || ageMatch[2]);
            medicalData.age = age;
            console.log('✓ 识别到年龄:', age);
          }

          // Extract gender (性别: 男/女)
          const genderMatch = rawText.match(/性别[：:\s]*(男|女)/);
          if (genderMatch) {
            medicalData.gender = genderMatch[1];
            console.log('✓ 识别到性别:', genderMatch[1]);
          }

          // Extract name (姓名: XXX) - more flexible pattern
          const nameMatch = rawText.match(/姓名[：:\s]*([^\s\n性别年龄病历]{2,10})/);
          if (nameMatch && nameMatch[1]) {
            const name = nameMatch[1].trim();
            medicalData.name = name;  // Store directly in name field
            console.log('✓ 识别到姓名:', name);
          }

          // Extract chief complaint (主诉: XXX) - capture everything until "病人签名"
          // This includes 主诉 + 现病史 sections (everything before patient signature)
          const chiefComplaintMatch = rawText.match(/主诉[：:\s]*([\s\S]*?)(?=病[人入]签名|签字日期|$)/);
          if (chiefComplaintMatch) {
            let complaint = chiefComplaintMatch[1].trim();
            // Clean up any trailing labels
            complaint = complaint.replace(/(?:签字|加重因素|缓解因素).*$/s, '').trim();

            // Remove unnecessary line breaks within sentences (but keep breaks before section headers)
            complaint = complaint.replace(/([^。！？\n])\n+(?!现病史|主诉|病史)/g, '$1');

            if (complaint && complaint.length > 0) {
              medicalData.chief_complaint = complaint;  // Use snake_case for database
              console.log('✓ 识别到主诉:', complaint);
            }
          }

          // Extract phone (电话/手机/联系方式: XXX)
          const phoneMatch = rawText.match(/(?:电话|手机|联系方式)[：:\s]*([0-9-]+)/);
          if (phoneMatch) {
            medicalData.phone = phoneMatch[1].trim();
            console.log('✓ 识别到电话:', phoneMatch[1]);
          }

          // Extract medical record number (病历号)
          const recordMatch = rawText.match(/病历号[：:\s]*(\d+)/);
          if (recordMatch) {
            const recordNumber = recordMatch[1];
            if (medicalData.remarks) {
              medicalData.remarks += `\n病历号: ${recordNumber}`;
            } else {
              medicalData.remarks = `病历号: ${recordNumber}`;
            }
            console.log('✓ 识别到病历号:', recordNumber);
          }

          // Extract present illness history (现病史)
          const presentIllnessMatch = rawText.match(/现病史[：:\s]*([\s\S]*?)(?=病入签名|签字|加重因素|缓解因素|$)/);
          if (presentIllnessMatch) {
            let presentIllness = presentIllnessMatch[1].trim();
            // Clean up any trailing labels
            presentIllness = presentIllness.replace(/(?:病入签名|签字|加重因素|缓解因素).*$/s, '').trim();
            if (presentIllness && presentIllness.length > 0) {
              // Append to remarks
              const remarkText = `\n\n【现病史】\n${presentIllness}`;
              if (medicalData.remarks) {
                medicalData.remarks += remarkText;
              } else {
                medicalData.remarks = remarkText;
              }
              console.log('✓ 识别到现病史:', presentIllness.substring(0, 50) + '...');
            }
          }

          // Extract date (various formats: YYYY-MM-DD HH:MM:SS, YYYY-MM-DDHH:MM, YYYY/MM/DD, etc.)
          const dateMatch = rawText.match(/(\d{4})[-\/年](\d{1,2})[-\/月](\d{1,2})[日\s-]*(\d{1,2}):(\d{1,2})/);
          if (dateMatch) {
            const dateStr = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
            const timeStr = `${dateMatch[4].padStart(2, '0')}:${dateMatch[5].padStart(2, '0')}`;
            const fullDateTime = `${dateStr} ${timeStr}`;
            // Store full datetime in onset_date
            medicalData.onset_date = fullDateTime;
            console.log('✓ 识别到日期:', fullDateTime);
          }

          // Merge medical data
          Object.keys(medicalData).forEach(key => {
            if (medicalData[key] && medicalData[key] !== "" && medicalData[key] !== null) {
              allMedicalData[key] = medicalData[key];
            }
          });

          // Store all raw OCR text in remarks for reference
          if (rawText) {
            const remarkText = `\n\n=== OCR原始文本 (图片 ${i + 1}) ===\n${rawText}`;
            if (allMedicalData.remarks) {
              allMedicalData.remarks += remarkText;
            } else {
              allMedicalData.remarks = remarkText;
            }
          }

        } catch (imageError) {
          console.error(`Processing image ${file.name} failed:`, imageError);
        }
      }

      setProcessingStep("数据识别完成！正在填充表单...");

      // Immediately fill the form
      onDataExtracted(allMedicalData);

      // Close modal and show success message
      setTimeout(() => {
        onClose();
        resetModal();
        alert(`成功识别并填充了${Object.keys(allMedicalData).length}个字段！\n请在表单中确认信息。`);
      }, 1000);

    } catch (error) {
      console.error("自动OCR处理失败:", error);
      throw error;
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  // 病历截图AI分析处理
  const processMedicalImages = async () => {
    if (uploadedImages.length === 0) {
      alert("请先上传至少一张图片");
      return;
    }

    setIsProcessing(true);
    setProcessingStep("本地OCR正在分析图片内容...");

    try {
      // Use local OCR API instead of base44
      let allMedicalData = {};

      // Process each image with local OCR
      for (let i = 0; i < uploadedImages.length; i++) {
        const image = uploadedImages[i];
        setProcessingStep(`正在分析第${i + 1}张图片: ${image.name}...`);

        try {
          // Convert image to base64
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.crossOrigin = 'anonymous';

          const imageBase64 = await new Promise((resolve, reject) => {
            img.onload = () => {
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              ctx.drawImage(img, 0, 0);
              const dataURL = canvas.toDataURL('image/jpeg', 0.95);
              resolve(dataURL);
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = image.preview;
          });

          // Call OCR service (port 5001)
          const response = await fetch('http://localhost:5001/ocr/process', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              image_base64: imageBase64
            })
          });

          if (!response.ok) {
            throw new Error(`OCR API error: ${response.status}`);
          }

          const result = await response.json();
          console.log('OCR Result:', result); // Debug log

          if (!result.success) {
            throw new Error(result.error || 'OCR processing failed');
          }

          // Extract raw text from OCR result
          const rawText = result.full_text || result.text_lines?.join('\n') || '';
          console.log('========== OCR识别结果 ==========');
          console.log('Raw OCR Text:', rawText);
          console.log('Text Lines:', result.text_lines);
          console.log('================================');

          // Pattern matching to extract medical data from Chinese text
          const medicalData = {};

          // Extract age (年龄: XX or XX岁 or just XX岁)
          const ageMatch = rawText.match(/年龄[：:\s]*(\d+)|(\d+)\s*岁/);
          if (ageMatch) {
            const age = parseInt(ageMatch[1] || ageMatch[2]);
            medicalData.age = age;
            console.log('✓ 识别到年龄:', age);
          }

          // Extract gender (性别: 男/女)
          const genderMatch = rawText.match(/性别[：:\s]*(男|女)/);
          if (genderMatch) {
            medicalData.gender = genderMatch[1];
            console.log('✓ 识别到性别:', genderMatch[1]);
          }

          // Extract name (姓名: XXX) - more flexible pattern
          const nameMatch = rawText.match(/姓名[：:\s]*([^\s\n性别年龄病历]{2,10})/);
          if (nameMatch && nameMatch[1]) {
            const name = nameMatch[1].trim();
            medicalData.name = name;  // Store directly in name field
            console.log('✓ 识别到姓名:', name);
          }

          // Extract chief complaint (主诉: XXX) - capture everything until "病人签名"
          // This includes 主诉 + 现病史 sections (everything before patient signature)
          const chiefComplaintMatch = rawText.match(/主诉[：:\s]*([\s\S]*?)(?=病[人入]签名|签字日期|$)/);
          if (chiefComplaintMatch) {
            let complaint = chiefComplaintMatch[1].trim();
            // Clean up any trailing labels
            complaint = complaint.replace(/(?:签字|加重因素|缓解因素).*$/s, '').trim();

            // Remove unnecessary line breaks within sentences (but keep breaks before section headers)
            complaint = complaint.replace(/([^。！？\n])\n+(?!现病史|主诉|病史)/g, '$1');

            if (complaint && complaint.length > 0) {
              medicalData.chief_complaint = complaint;  // Use snake_case for database
              console.log('✓ 识别到主诉:', complaint);
            }
          }

          // Extract phone (电话/手机/联系方式: XXX)
          const phoneMatch = rawText.match(/(?:电话|手机|联系方式)[：:\s]*([0-9-]+)/);
          if (phoneMatch) {
            medicalData.phone = phoneMatch[1].trim();
            console.log('✓ 识别到电话:', phoneMatch[1]);
          }

          // Extract medical record number (病历号)
          const recordMatch = rawText.match(/病历号[：:\s]*(\d+)/);
          if (recordMatch) {
            const recordNumber = recordMatch[1];
            if (medicalData.remarks) {
              medicalData.remarks += `\n病历号: ${recordNumber}`;
            } else {
              medicalData.remarks = `病历号: ${recordNumber}`;
            }
            console.log('✓ 识别到病历号:', recordNumber);
          }

          // Extract present illness history (现病史)
          const presentIllnessMatch = rawText.match(/现病史[：:\s]*([\s\S]*?)(?=病入签名|签字|加重因素|缓解因素|$)/);
          if (presentIllnessMatch) {
            let presentIllness = presentIllnessMatch[1].trim();
            // Clean up any trailing labels
            presentIllness = presentIllness.replace(/(?:病入签名|签字|加重因素|缓解因素).*$/s, '').trim();
            if (presentIllness && presentIllness.length > 0) {
              // Append to remarks
              const remarkText = `\n\n【现病史】\n${presentIllness}`;
              if (medicalData.remarks) {
                medicalData.remarks += remarkText;
              } else {
                medicalData.remarks = remarkText;
              }
              console.log('✓ 识别到现病史:', presentIllness.substring(0, 50) + '...');
            }
          }

          // Extract date (various formats: YYYY-MM-DD HH:MM:SS, YYYY-MM-DDHH:MM, YYYY/MM/DD, etc.)
          const dateMatch = rawText.match(/(\d{4})[-\/年](\d{1,2})[-\/月](\d{1,2})[日\s-]*(\d{1,2}):(\d{1,2})/);
          if (dateMatch) {
            const dateStr = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
            const timeStr = `${dateMatch[4].padStart(2, '0')}:${dateMatch[5].padStart(2, '0')}`;
            const fullDateTime = `${dateStr} ${timeStr}`;
            // Store full datetime in onset_date
            medicalData.onset_date = fullDateTime;
            console.log('✓ 识别到日期:', fullDateTime);
          }

          // Merge medical data from multiple images
          Object.keys(medicalData).forEach(key => {
            if (medicalData[key] && medicalData[key] !== "" && medicalData[key] !== null) {
              allMedicalData[key] = medicalData[key];
            }
          });

          // Store all raw OCR text in remarks for reference
          if (rawText) {
            const remarkText = `\n\n=== OCR原始文本 (${image.name}) ===\n${rawText}`;
            if (allMedicalData.remarks) {
              allMedicalData.remarks += remarkText;
            } else {
              allMedicalData.remarks = remarkText;
            }
          }

        } catch (imageError) {
          console.error(`Processing image ${image.name} failed:`, imageError);
          const errorMsg = `图片${i + 1}(${image.name}) 处理失败: ${imageError.message}`;
          if (allMedicalData.remarks) {
            allMedicalData.remarks += '\n\n' + errorMsg;
          } else {
            allMedicalData.remarks = errorMsg;
          }
        }
      }

      setProcessingStep("数据处理完成！");

      // 合并病历数据和姿态分析结果
      const finalData = { ...allMedicalData };
      if (postureAnalysisResult) {
        finalData.ai_posture_analysis = postureAnalysisResult;
      }

      onDataExtracted(finalData);

      setTimeout(() => {
        onClose();
        resetModal();
      }, 1000);

    } catch (error) {
      console.error("OCR处理失败:", error);
      alert(`本地OCR处理失败: ${error.message || '未知错误，请重试'}`);
      setProcessingStep("");
    }

    setIsProcessing(false);
  };

  // 姿态分析处理
  const analyzePosture = async () => {
    if (!posturePhotos.standing || !posturePhotos.flexion) {
      alert("请先上传站立和弯腰两张姿势照片");
      return;
    }

    setIsProcessing(true);
    setProcessingStep("AI正在分析姿势和计算活动范围...");

    try {
      const imageUrls = [posturePhotos.standing.url, posturePhotos.flexion.url];
      
      const prompt = `
你是一个顶级的生物力学和物理治疗专家。请仔细分析我提供的两张侧面姿势照片：
- **图片1**: 患者自然站立位
- **图片2**: 患者最大前屈位

请完成以下任务，并严格按照指定的JSON格式返回结果：

1.  **识别关键点**: 在两张图片中，分别识别出以下四个身体关键点的坐标 (x, y)，坐标系原点为图片左上角。
    -   \`shoulder\` (肩关节中心)
    -   \`hip\` (髋关节中心，即股骨头位置)
    -   \`knee\` (膝关节中心) 
    -   \`ankle\` (踝关节中心)
    如果某个点无法识别，请返回null。

2.  **计算角度**:
    -   以髋关节为轴心，计算躯干线（髋-肩连线）与垂直线的夹角，分别记为 \`standing_trunk_angle\` 和 \`flexion_trunk_angle\`。
    -   计算前屈活动范围 (ROM): \`rom_degrees = |flexion_trunk_angle - standing_trunk_angle|\`。

3.  **提供评估**:
    -   根据ROM度数，给出 \`rom_assessment\` (正常, 轻度受限, 中度受限, 重度受限)。
    -   观察并描述任何代偿动作 (\`compensations\`)。
    -   给出简短的改善建议 (\`recommendations\`)。

**输出要求**:
返回一个JSON对象，包含所有计算结果和两张图的关键点坐标。
`;

      const result = await InvokeLLM({
        prompt: prompt,
        file_urls: imageUrls,
        response_json_schema: {
          type: "object",
          properties: {
            standing_trunk_angle: { type: "number", description: "站立时躯干角度" },
            flexion_trunk_angle: { type: "number", description: "最大前屈时躯干角度" },
            rom_degrees: { type: "number", description: "前屈活动范围(度)" },
            rom_assessment: { type: "string", enum: ["正常", "轻度受限", "中度受限", "重度受限"], description: "活动范围评估" },
            compensations: { type: "string", description: "观察到的代偿动作" },
            recommendations: { type: "string", description: "功能改善建议" },
            standing_keypoints: {
              type: "object",
              description: "站立姿势的关键点坐标",
              properties: {
                shoulder: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } },
                hip: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } },
                knee: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } },
                ankle: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } }
              }
            },
            flexion_keypoints: {
              type: "object",
              description: "屈曲姿势的关键点坐标",
               properties: {
                shoulder: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } },
                hip: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } },
                knee: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } },
                ankle: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } }
              }
            }
          }
        }
      });

      setProcessingStep("正在生成姿态分析图...");

      // Draw skeletons on images
      const annotatedImagePromises = [];
      if (result.standing_keypoints) {
        annotatedImagePromises.push(drawSkeletonOnImage(posturePhotos.standing.preview, result.standing_keypoints));
      } else {
        annotatedImagePromises.push(Promise.resolve(null));
      }

      if (result.flexion_keypoints) {
        annotatedImagePromises.push(drawSkeletonOnImage(posturePhotos.flexion.preview, result.flexion_keypoints));
      } else {
        annotatedImagePromises.push(Promise.resolve(null));
      }

      const [annotatedStandingUrl, annotatedFlexionUrl] = await Promise.all(annotatedImagePromises);

      const finalResult = {
        ...result,
        annotatedStandingUrl,
        annotatedFlexionUrl
      };

      setPostureAnalysisResult(finalResult);
      setProcessingStep("姿态分析完成！");

    } catch (error) {
      console.error("姿势分析失败:", error);
      alert(`姿势分析失败: ${error.message || '未知错误，请重试'}`);
      setProcessingStep("");
    }

    setIsProcessing(false);
  };

  // 最终提交所有数据
  const processAllData = async () => {
    let finalData = {};

    // 如果有病历截图，先分析
    if (uploadedImages.length > 0) {
      await processMedicalImages();
      return; // processMedicalImages 已经处理了数据合并和回调
    }

    // 如果只有姿态分析结果
    if (postureAnalysisResult) {
      finalData.ai_posture_analysis = postureAnalysisResult;
      onDataExtracted(finalData);
      
      setTimeout(() => {
        onClose();
        resetModal();
      }, 1000);
      return;
    }

    alert("请先上传图片或完成姿态分析");
  };

  const resetModal = () => {
    // 清理病历截图
    uploadedImages.forEach(img => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview);
      }
    });
    
    // 清理姿态照片
    Object.values(posturePhotos).forEach(photo => {
      if (photo?.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    });
    
    setUploadedImages([]);
    setPosturePhotos({ standing: null, flexion: null });
    setPostureAnalysisResult(null);
    setIsProcessing(false);
    setProcessingStep("");
    setIsDragOver(false);
    setDragType(null);
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetModal();
      onClose();
    }
  };

  const PosturePhotoUploadArea = ({ type, title, description }) => (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragOver && dragType === type
          ? 'border-emerald-400 bg-emerald-50' 
          : 'border-slate-300'
      } ${
        isProcessing || posturePhotos[type] 
          ? 'opacity-75' 
          : 'cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50'
      }`}
      onClick={() => !isProcessing && !posturePhotos[type] && (type === 'standing' ? standingInputRef.current?.click() : flexionInputRef.current?.click())}
      onDrop={(e) => !isProcessing && handlePostureDrop(e, type)}
      onDragOver={(e) => !isProcessing && handleDragOver(e, type)}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={type === 'standing' ? standingInputRef : flexionInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handlePostureFileInputChange(e, type)}
        className="hidden"
        disabled={isProcessing || !!posturePhotos[type]}
      />
      
      {posturePhotos[type] ? (
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={posturePhotos[type].preview}
              alt={title}
              className="w-32 h-32 object-cover rounded-lg border-2 border-emerald-200"
            />
            {!isProcessing && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  removePosturePhoto(type);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          <p className="text-sm font-medium text-emerald-700">{title} ✓</p>
          <p className="text-xs text-slate-500 truncate">{posturePhotos[type].name}</p>
        </div>
      ) : (
        <>
          <Camera className={`w-12 h-12 mx-auto mb-4 ${isDragOver && dragType === type ? 'text-emerald-600' : 'text-slate-400'}`} />
          <h4 className={`font-medium mb-2 ${isDragOver && dragType === type ? 'text-emerald-800' : 'text-slate-600'}`}>
            {title}
          </h4>
          <p className="text-sm text-slate-500 mb-3">{description}</p>
          <div className="text-xs text-slate-400 mb-3">
            点击上传或拖拽图片到此处
          </div>

          {/* 裁剪上传按钮 */}
          <div className="flex flex-col gap-2">
            <input
              ref={type === 'standing' ? postureStandingCropInputRef : postureFlexionCropInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  openCropModal(file, type);
                }
                e.target.value = '';
              }}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                const ref = type === 'standing' ? postureStandingCropInputRef : postureFlexionCropInputRef;
                ref.current?.click();
              }}
              className="flex items-center gap-1 text-xs"
              disabled={isProcessing || !!posturePhotos[type]}
            >
              <Crop className="w-3 h-3" />
              裁剪上传
            </Button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
            智能图片录入
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="medical" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="medical" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              病历截图识别
            </TabsTrigger>
            <TabsTrigger value="posture" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              姿态分析
            </TabsTrigger>
          </TabsList>

          <TabsContent value="medical" className="space-y-4 mt-6">
            <div className="text-sm text-slate-600 bg-blue-50 p-3 rounded-lg">
              <p className="font-medium mb-1">病历截图识别：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>上传包含患者信息的图片（病历、检查报告等）</li>
                <li>支持拖拽上传，最多可上传5张图片</li>
                <li>AI将自动识别并填写表单数据</li>
              </ul>
            </div>

            {/* 上传区域 */}
            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver && !dragType
                  ? 'border-emerald-400 bg-emerald-50' 
                  : 'border-slate-300'
              } ${
                isProcessing || uploadedImages.length >= 5 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50'
              }`}
              onClick={() => !isProcessing && uploadedImages.length < 5 && fileInputRef.current?.click()}
              onDrop={(e) => !isProcessing && handleDrop(e, 'medical')}
              onDragOver={(e) => !isProcessing && handleDragOver(e)}
              onDragLeave={handleDragLeave}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isProcessing || uploadedImages.length >= 5}
              />
              
              <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver && !dragType ? 'text-emerald-600' : 'text-slate-400'}`} />
              <p className={`mb-2 ${isDragOver && !dragType ? 'text-emerald-800' : 'text-slate-600'}`}>
                {isDragOver && !dragType ? '松开鼠标上传图片' : '点击上传图片或拖拽图片到此处'}
              </p>
              <p className="text-sm text-slate-500 mb-4">
                已上传 {uploadedImages.length}/5 张图片
              </p>
              
              {uploadedImages.length < 5 && !isProcessing && (
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  选择图片
                </Button>
              )}
            </div>

            {/* 图片裁剪上传选项 */}
            <div className="flex items-center justify-center gap-4 py-3 border-t border-slate-200">
              <p className="text-sm text-slate-600">或者上传并裁剪图片:</p>
              <div className="flex gap-2">
                <input
                  ref={cropFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      openCropModal(file, 'medical');
                    }
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => cropFileInputRef.current?.click()}
                  className="flex items-center gap-2"
                  disabled={isProcessing || uploadedImages.length >= 5}
                >
                  <Crop className="w-4 h-4" />
                  裁剪上传
                </Button>
                <Button
                  variant="outline"
                  onClick={uploadLatestSunloginScreenshot}
                  className="flex items-center gap-2"
                  disabled={isProcessing || uploadedImages.length >= 5}
                >
                  <ImageIcon className="w-4 h-4" />
                  Sunlogin最新截图
                </Button>
              </div>
            </div>

            {/* 图片预览 */}
            {uploadedImages.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-slate-800">已上传的图片：</h4>
                <div className="grid grid-cols-2 gap-3">
                  {uploadedImages.map((image) => (
                    <Card key={image.id} className="relative">
                      <CardContent className="p-3">
                        <div className="relative">
                          <img
                            src={image.preview}
                            alt={image.name}
                            className="w-full h-24 object-contain rounded"
                          />
                          {!isProcessing && (
                            <Button
                              size="icon"
                              variant="destructive"
                              className="absolute -top-2 -right-2 w-6 h-6"
                              onClick={() => removeImage(image.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-2 truncate">
                          {image.name}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="posture" className="space-y-4 mt-6">
            <div className="text-sm text-slate-600 bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">拍照指导：</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-blue-800 mb-1">📍 拍照要求：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>从患者正侧面拍摄（90度角）</li>
                    <li>保持相机高度与患者腰部平齐</li>
                    <li>确保患者全身都在画面内</li>
                    <li>两张照片保持相同的拍摄位置和角度</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-blue-800 mb-1">📋 动作指导：</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>站立位</strong>：自然放松站立</li>
                    <li><strong>前屈位</strong>：双手向下摸地，尽力弯腰</li>
                    <li>动作要缓慢，避免弹震</li>
                    <li>到达最大角度时保持2-3秒拍照</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 姿态照片上传区域 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PosturePhotoUploadArea
                type="standing"
                title="自然站立位"
                description="患者放松站立时的侧面照片"
              />
              <PosturePhotoUploadArea
                type="flexion"
                title="最大前屈位"
                description="患者最大前屈弯腰时的侧面照片"
              />
            </div>

            {/* 姿态分析按钮 */}
            {posturePhotos.standing && posturePhotos.flexion && !postureAnalysisResult && (
              <div className="text-center">
                <Button
                  onClick={analyzePosture}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI分析中...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      开始姿态分析
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* 姿态分析结果 */}
            {postureAnalysisResult && (
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <h5 className="font-medium text-slate-800 mb-3">姿态分析结果：</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <span className="text-slate-600">前屈活动范围：</span>
                    <span className="font-semibold text-blue-700 ml-1">
                      {postureAnalysisResult.rom_degrees}°
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">功能评估：</span>
                    <span className="font-semibold ml-1">
                      {postureAnalysisResult.rom_assessment}
                    </span>
                  </div>
                  {postureAnalysisResult.compensations && (
                    <div className="md:col-span-2">
                      <span className="text-slate-600">代偿动作：</span>
                      <span className="ml-1">{postureAnalysisResult.compensations}</span>
                    </div>
                  )}
                  {postureAnalysisResult.recommendations && (
                    <div className="md:col-span-2">
                      <span className="text-slate-600">建议：</span>
                      <span className="ml-1">{postureAnalysisResult.recommendations}</span>
                    </div>
                  )}
                </div>
                
                {/* 骨架分析图 */}
                {(postureAnalysisResult.annotatedStandingUrl || postureAnalysisResult.annotatedFlexionUrl) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    {postureAnalysisResult.annotatedStandingUrl && (
                      <div className="space-y-2">
                        <p className="font-medium text-sm text-center text-slate-700">站立位姿态分析</p>
                        <img src={postureAnalysisResult.annotatedStandingUrl} alt="站立位姿态分析" className="rounded-lg border bg-slate-100" />
                      </div>
                    )}
                    {postureAnalysisResult.annotatedFlexionUrl && (
                      <div className="space-y-2">
                         <p className="font-medium text-sm text-center text-slate-700">屈曲位姿态分析</p>
                        <img src={postureAnalysisResult.annotatedFlexionUrl} alt="屈曲位姿态分析" className="rounded-lg border bg-slate-100" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* 处理状态 */}
        {processingStep && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-blue-800">{processingStep}</span>  
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isProcessing}
          >
            取消
          </Button>
          
          <Button
            onClick={processAllData}
            disabled={isProcessing || (uploadedImages.length === 0 && !postureAnalysisResult)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                处理中...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                完成数据录入
              </>
            )}
          </Button>
        </div>
      </DialogContent>

      {/* 图片裁剪弹窗 */}
      <Dialog open={cropModalOpen} onOpenChange={setCropModalOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="w-5 h-5 text-emerald-600" />
              裁剪图片 - {cropType === 'medical' ? '病历截图' : cropType === 'standing' ? '站立姿势' : '前屈姿势'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {imageToCrop && (
              <div className="flex flex-col items-center space-y-4">
                {/* 裁剪区域管理 */}
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">裁剪区域:</span>
                    <div className="flex gap-1">
                      {cropAreas.map((area, index) => (
                        <Button
                          key={area.id}
                          size="sm"
                          variant={index === currentCropIndex ? "default" : "outline"}
                          onClick={() => switchCropArea(index)}
                          className="px-3 py-1 h-8"
                        >
                          区域 {index + 1}
                          {area.completedCrop && <CheckCircle className="w-3 h-3 ml-1 text-green-500" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={addCropArea}
                      className="px-3 py-1 h-8"
                      disabled={cropAreas.length >= 2}
                    >
                      +添加区域
                    </Button>
                    {cropAreas.length > 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeCropArea(currentCropIndex)}
                        className="px-3 py-1 h-8 text-red-600 hover:text-red-700"
                      >
                        删除当前
                      </Button>
                    )}
                  </div>
                </div>

                {/* 图片裁剪区域 */}
                <div className="w-full max-h-[600px] overflow-hidden rounded-lg border">
                  <ReactCrop
                    crop={cropAreas[currentCropIndex]?.crop}
                    onChange={handleCropChange}
                    onComplete={handleCropComplete}
                    aspect={undefined}
                    className="max-h-[600px]"
                  >
                    <img
                      ref={setCropImageRef}
                      src={imageToCrop.url}
                      alt="裁剪预览"
                      className="max-w-full max-h-[600px] object-contain"
                    />
                  </ReactCrop>
                </div>

                {/* 当前区域状态提示 */}
                <div className="text-center text-sm text-slate-600">
                  当前编辑: 区域 {currentCropIndex + 1}
                  {cropAreas[currentCropIndex]?.completedCrop ? (
                    <span className="text-green-600 ml-2">✓ 已完成</span>
                  ) : (
                    <span className="text-orange-600 ml-2">○ 待完成</span>
                  )}
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={cancelCrop}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={applyCrop}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                    disabled={!cropAreas.some(area => area.completedCrop)}
                  >
                    确认裁剪 ({cropAreas.filter(area => area.completedCrop).length}个区域)
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}