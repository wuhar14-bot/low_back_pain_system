
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
import { Upload, X, Camera, Loader2, CheckCircle, RotateCcw, User } from "lucide-react";
// Note: UploadFile and InvokeLLM not needed for MediaPipe pose analysis
// We process images locally without external API calls

// Helper function: Convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Helper function: Draw MediaPipe skeleton with 33 landmarks
const drawMediaPipeSkeletonOnImage = (imageSrc, landmarks) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.drawImage(img, 0, 0);

      // Scale landmarks to image dimensions
      // MediaPipe returns normalized coordinates (0-1), scale to pixels
      const scaledLandmarks = landmarks.map(lm => ({
        x: lm.x * img.naturalWidth,
        y: lm.y * img.naturalHeight,
        visibility: lm.visibility
      }));

      // Define MediaPipe pose connections (33 landmarks)
      // https://developers.google.com/mediapipe/solutions/vision/pose_landmarker
      const POSE_CONNECTIONS = [
        // Face
        [0, 1], [1, 2], [2, 3], [3, 7],  // Nose to left
        [0, 4], [4, 5], [5, 6], [6, 8],  // Nose to right
        // Shoulders
        [11, 12],  // Shoulder line
        // Arms
        [11, 13], [13, 15], [15, 17], [15, 19], [15, 21],  // Left arm
        [12, 14], [14, 16], [16, 18], [16, 20], [16, 22],  // Right arm
        // Torso
        [11, 23], [12, 24],  // Shoulders to hips
        [23, 24],  // Hip line
        // Legs
        [23, 25], [25, 27], [27, 29], [27, 31], [29, 31],  // Left leg
        [24, 26], [26, 28], [28, 30], [28, 32], [30, 32],  // Right leg
      ];

      // Draw connections
      ctx.strokeStyle = '#34D399'; // Emerald-400
      ctx.lineWidth = Math.max(3, img.naturalWidth / 400);
      ctx.lineCap = 'round';

      POSE_CONNECTIONS.forEach(([i, j]) => {
        const p1 = scaledLandmarks[i];
        const p2 = scaledLandmarks[j];

        if (p1 && p2 && p1.visibility > 0.5 && p2.visibility > 0.5) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      });

      // Draw keypoints
      scaledLandmarks.forEach((point, idx) => {
        if (point && point.visibility > 0.5) {
          ctx.beginPath();
          const radius = Math.max(4, img.naturalWidth / 250);

          // Highlight key clinical points (shoulders, hips) in red
          if ([11, 12, 23, 24].includes(idx)) {
            ctx.fillStyle = '#EF4444'; // Red for shoulders & hips
            ctx.arc(point.x, point.y, radius * 1.5, 0, 2 * Math.PI);
          } else {
            ctx.fillStyle = '#10B981'; // Emerald-500 for other points
            ctx.arc(point.x, point.y, radius, 0, 2 * Math.PI);
          }

          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = Math.max(1.5, img.naturalWidth / 800);
          ctx.stroke();
        }
      });

      resolve(canvas.toDataURL());
    };

    img.onerror = () => reject(new Error("图片加载失败，无法绘制骨架"));
    img.src = imageSrc;
  });
};

// Old function for LLM-based keypoints (4 points) - kept for backward compatibility
const drawSkeletonOnImage = (imageSrc, keypoints) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous"; // Handle potential CORS issues if image is not a data URL
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Assume AI provides coordinates for a 1920x1080 base resolution.
      // We need to scale these coordinates to the actual image dimensions.
      const aiBaseWidth = 1920;
      const aiBaseHeight = 1080;

      const scaleX = img.naturalWidth / aiBaseWidth;
      const scaleY = img.naturalHeight / aiBaseHeight;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      
      ctx.drawImage(img, 0, 0);

      // Define connections for the torso and lower limb
      // (shoulder, hip, knee, ankle are the keypoints we are asking for)
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
      
      // Draw connections
      ctx.strokeStyle = '#34D399'; // Emerald-400
      // Line width should scale with the image size, but have a minimum
      ctx.lineWidth = Math.max(4, Math.min(img.naturalWidth, img.naturalHeight) / 300); 
      ctx.lineCap = 'round';

      connections.forEach(([p1, p2]) => {
        if (scaledKeypoints[p1] && scaledKeypoints[p2]) {
          ctx.beginPath();
          ctx.moveTo(scaledKeypoints[p1].x, scaledKeypoints[p1].y);
          ctx.lineTo(scaledKeypoints[p2].x, scaledKeypoints[p2].y);
          ctx.stroke();
        }
      });
      
      // Draw keypoints
      Object.values(scaledKeypoints).forEach(point => {
        ctx.beginPath();
        // Point radius should scale with the image size, but have a minimum
        ctx.arc(point.x, point.y, Math.max(6, Math.min(img.naturalWidth, img.naturalHeight) / 180), 0, 2 * Math.PI); 
        ctx.fillStyle = '#10B981'; // Emerald-500
        ctx.fill();
        ctx.strokeStyle = 'white';
        // Border width should scale
        ctx.lineWidth = Math.max(2, Math.min(img.naturalWidth, img.naturalHeight) / 600); 
        ctx.stroke();
      });

      resolve(canvas.toDataURL());
    };
    
    img.onerror = () => reject(new Error("图片加载失败，无法绘制骨架。"));
    img.src = imageSrc;
  });
};


export default function PostureAnalysisModal({ isOpen, onClose, onAnalysisComplete }) {
  const [photos, setPhotos] = useState({
    standing: null,
    flexion: null
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragType, setDragType] = useState(null);
  const standingInputRef = useRef(null);
  const flexionInputRef = useRef(null);

  const handleFileSelect = async (file, type) => {
    if (!file || !file.type.startsWith('image/')) {
      alert("请选择图片文件");
      return;
    }

    try {
      // For MediaPipe pose analysis, we only need local file preview
      // No need to upload to external service
      const previewUrl = URL.createObjectURL(file);

      setPhotos(prev => ({
        ...prev,
        [type]: {
          file,
          name: file.name,
          preview: previewUrl
        }
      }));

    } catch (error) {
      console.error("图片处理失败:", error);
      alert(`图片处理失败：${error.message || '未知错误'}`);
    }
  };

  const handleFileInputChange = (event, type) => {
    if (event.target.files && event.target.files[0]) {
      handleFileSelect(event.target.files[0], type);
    }
  };

  const handleDrop = (event, type) => {
    event.preventDefault();
    setIsDragOver(false);
    setDragType(null);
    
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileSelect(event.dataTransfer.files[0], type);
    }
  };

  const handleDragOver = (event, type) => {
    event.preventDefault();
    setIsDragOver(true);
    setDragType(type);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    setDragType(null);
  };

  const removePhoto = (type) => {
    if (photos[type]?.preview) {
      URL.revokeObjectURL(photos[type].preview);
    }
    setPhotos(prev => ({
      ...prev,
      [type]: null
    }));
  };

  const analyzePosture = async () => {
    if (!photos.standing || !photos.flexion) {
      alert("请先上传站立和弯腰两张姿势照片");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStep("正在处理图片...");

    try {
      // Convert images to base64
      const standingBase64 = await fileToBase64(photos.standing.file);
      const flexionBase64 = await fileToBase64(photos.flexion.file);

      setAnalysisStep("MediaPipe AI正在分析姿势和计算活动范围...");

      // Call MediaPipe pose service
      const response = await fetch('http://localhost:5002/pose/analyze-static', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standing_image: standingBase64,
          flexion_image: flexionBase64,
          calculate_rom: true,
          detect_compensations: true
        })
      });

      if (!response.ok) {
        throw new Error(`Pose analysis failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Pose analysis failed');
      }

      setAnalysisStep("正在生成姿态分析图...");

      // Draw skeletons with 33 MediaPipe landmarks
      const annotatedStandingUrl = await drawMediaPipeSkeletonOnImage(
        photos.standing.preview,
        result.standing_analysis.landmarks
      );

      const annotatedFlexionUrl = await drawMediaPipeSkeletonOnImage(
        photos.flexion.preview,
        result.flexion_analysis.landmarks
      );

      // Format result to match expected structure
      const finalResult = {
        standing_trunk_angle: result.standing_analysis.trunk_angle,
        flexion_trunk_angle: result.flexion_analysis.trunk_angle,
        rom_degrees: result.rom_analysis.rom_degrees,
        rom_assessment: result.rom_analysis.rom_assessment,
        compensations: result.rom_analysis.compensations,
        recommendations: result.rom_analysis.recommendations,
        annotatedStandingUrl,
        annotatedFlexionUrl,
        // Additional data for reference
        standing_pelvic_tilt: result.standing_analysis.pelvic_tilt,
        flexion_pelvic_tilt: result.flexion_analysis.pelvic_tilt,
        standing_knee_angle: result.standing_analysis.knee_angle,
        flexion_knee_angle: result.flexion_analysis.knee_angle
      };

      setAnalysisStep("分析完成！");

      onAnalysisComplete(finalResult);

      // 1 second delay before closing modal
      setTimeout(() => {
        onClose();
        resetModal();
      }, 1000);

    } catch (error) {
      console.error("姿势分析失败:", error);
      alert(`姿势分析失败: ${error.message || '未知错误，请重试'}`);
      setAnalysisStep("");
    }

    setIsAnalyzing(false);
  };

  const resetModal = () => {
    // Clean up all preview URLs
    Object.values(photos).forEach(photo => {
      if (photo?.preview) {
        URL.revokeObjectURL(photo.preview);
      }
    });
    
    setPhotos({ standing: null, flexion: null });
    setIsAnalyzing(false);
    setAnalysisStep("");
    setIsDragOver(false);
    setDragType(null);
  };

  const handleClose = () => {
    if (!isAnalyzing) {
      resetModal();
      onClose();
    }
  };

  const PhotoUploadArea = ({ type, title, description }) => (
    <div 
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragOver && dragType === type
          ? 'border-emerald-400 bg-emerald-50' 
          : 'border-slate-300'
      } ${
        isAnalyzing || photos[type] 
          ? 'opacity-75' 
          : 'cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50'
      }`}
      onClick={() => !isAnalyzing && !photos[type] && (type === 'standing' ? standingInputRef.current?.click() : flexionInputRef.current?.click())}
      onDrop={(e) => !isAnalyzing && handleDrop(e, type)}
      onDragOver={(e) => !isAnalyzing && handleDragOver(e, type)}
      onDragLeave={handleDragLeave}
    >
      <input
        ref={type === 'standing' ? standingInputRef : flexionInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileInputChange(e, type)}
        className="hidden"
        disabled={isAnalyzing || !!photos[type]}
      />
      
      {photos[type] ? (
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={photos[type].preview}
              alt={title}
              className="w-32 h-32 object-cover rounded-lg border-2 border-emerald-200"
            />
            {!isAnalyzing && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6"
                onClick={(e) => {
                  e.stopPropagation();
                  removePhoto(type);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
          <p className="text-sm font-medium text-emerald-700">{title} ✓</p>
          <p className="text-xs text-slate-500 truncate">{photos[type].name}</p>
        </div>
      ) : (
        <>
          <Camera className={`w-12 h-12 mx-auto mb-4 ${isDragOver && dragType === type ? 'text-emerald-600' : 'text-slate-400'}`} />
          <h4 className={`font-medium mb-2 ${isDragOver && dragType === type ? 'text-emerald-800' : 'text-slate-600'}`}>
            {title}
          </h4>
          <p className="text-sm text-slate-500 mb-3">{description}</p>
          <div className="text-xs text-slate-400">
            点击上传或拖拽图片到此处
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
            <RotateCcw className="w-5 h-5 text-blue-600" />
            AI姿态分析 - 前屈活动范围测量
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* 使用说明 */}
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

          {/* 分析状态 */}
          {analysisStep && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span className="text-blue-800">{analysisStep}</span>
            </div>
          )}

          {/* 照片上传区域 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PhotoUploadArea
              type="standing"
              title="自然站立位"
              description="患者放松站立时的侧面照片"
            />
            <PhotoUploadArea
              type="flexion"
              title="最大前屈位"
              description="患者最大前屈弯腰时的侧面照片"
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isAnalyzing}
            >
              取消
            </Button>
            
            <Button
              onClick={analyzePosture}
              disabled={isAnalyzing || !photos.standing || !photos.flexion}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              {isAnalyzing ? (
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
