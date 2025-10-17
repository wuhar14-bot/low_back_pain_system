
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
import { UploadFile, InvokeLLM } from "@/api/integrations";

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
      setAnalysisStep(`正在上传${type === 'standing' ? '站立' : '弯腰'}姿势照片...`);
      
      const { file_url } = await UploadFile({ file });
      const previewUrl = URL.createObjectURL(file);
      
      setPhotos(prev => ({
        ...prev,
        [type]: {
          file,
          url: file_url,
          name: file.name,
          preview: previewUrl
        }
      }));
      
      setAnalysisStep("");
    } catch (error) {
      console.error("图片上传失败:", error);
      alert(`图片上传失败：${error.message || '未知错误'}`);
      setAnalysisStep("");
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
    setAnalysisStep("AI正在分析姿势和计算活动范围...");

    try {
      const imageUrls = [photos.standing.url, photos.flexion.url];
      
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
    如果某个点无法识别，请返回null。请提供这些关键点在假定1920x1080像素图像上的坐标。

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
              description: "站立姿势的关键点坐标 (x,y)",
              properties: {
                shoulder: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } },
                hip: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } },
                knee: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } },
                ankle: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } }
              },
              nullable: true // Allow null if keypoints cannot be detected
            },
            flexion_keypoints: {
              type: "object",
              description: "屈曲姿势的关键点坐标 (x,y)",
               properties: {
                shoulder: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } },
                hip: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } },
                knee: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } },
                ankle: { type: "object", properties: { "x": {"type": "number"}, "y": {"type": "number"} } }
              },
              nullable: true // Allow null if keypoints cannot be detected
            }
          },
          required: ["standing_trunk_angle", "flexion_trunk_angle", "rom_degrees", "rom_assessment", "compensations", "recommendations"] // These are always expected
        }
      });

      setAnalysisStep("正在生成姿态分析图...");

      // Draw skeletons on images
      const annotatedImagePromises = [];
      if (result.standing_keypoints) {
        annotatedImagePromises.push(drawSkeletonOnImage(photos.standing.preview, result.standing_keypoints));
      } else {
        annotatedImagePromises.push(Promise.resolve(null)); // Keep order, resolve with null if no keypoints
      }

      if (result.flexion_keypoints) {
        annotatedImagePromises.push(drawSkeletonOnImage(photos.flexion.preview, result.flexion_keypoints));
      } else {
        annotatedImagePromises.push(Promise.resolve(null)); // Keep order, resolve with null if no keypoints
      }

      const [annotatedStandingUrl, annotatedFlexionUrl] = await Promise.all(annotatedImagePromises);

      const finalResult = {
        ...result,
        annotatedStandingUrl,
        annotatedFlexionUrl
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
