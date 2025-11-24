
import React, { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Calendar, AlertCircle, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadFile, InvokeLLM } from "@/api/integrations";


export default function MedicalHistorySection({ formData, updateFormData }) {
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };
  
  const handleOcrButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsOcrLoading(true);
    try {
      // Step 1: Upload the file to get a URL
      const { file_url } = await UploadFile({ file });
      
      // Step 2: Use InvokeLLM with the file URL for high-quality OCR
      const extractedText = await InvokeLLM({
        prompt: "你是一个顶级的OCR文字识别引擎。请精确地提取这张图片中的所有文字。请直接返回纯文本内容，保留原始的格式和换行符，不要添加任何额外的解释、标签或总结。",
        file_urls: [file_url],
      });

      if (extractedText && typeof extractedText === 'string' && extractedText.trim().length > 0) {
        const existingText = formData.chief_complaint || '';
        // Prepend new text for better visibility, separated by a clear marker
        const newText = existingText 
          ? `${extractedText}\n\n--- (以上为本次识别内容) ---\n\n${existingText}` 
          : extractedText;
        handleInputChange('chief_complaint', newText);
      } else {
        throw new Error('未能识别到任何文字，请检查图片是否清晰或内容是否可读。');
      }

    } catch (error) {
      console.error("OCR Error:", error);
      alert(`文字识别失败: ${error.message}`);
    } finally {
      setIsOcrLoading(false);
      // Reset file input so the same file can be selected again
      if(fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };


  const handleRadiationChange = (hasRadiation) => {
    updateFormData({ 
      has_radiation: hasRadiation,
      radiation_location: hasRadiation ? (formData.radiation_location || '') : ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chief_complaint" className="text-slate-700 font-medium flex items-center gap-2">
            <FileText className="w-4 h-4" />
            主诉
          </Label>
          <Textarea
            id="chief_complaint"
            value={formData.chief_complaint || ''}
            onChange={(e) => handleInputChange('chief_complaint', e.target.value)}
            placeholder="请描述患者主要症状，或使用文字识别功能"
            className="bg-white border-slate-200 h-24"
          />
          <div className="flex justify-end">
             <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={handleOcrButtonClick}
              disabled={isOcrLoading}
            >
              {isOcrLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Camera className="w-4 h-4 mr-2" />
              )}
              {isOcrLoading ? '识别中...' : '文字识别'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">现病史类型</Label>
            <Select
              value={formData.history_type || ''}
              onValueChange={(value) => handleInputChange('history_type', value)}
            >
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="首次发作">首次发作</SelectItem>
                <SelectItem value="复发">复发</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="first_onset_date" className="text-slate-700 font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              初次发作日期
            </Label>
            <Input
              id="first_onset_date"
              type="date"
              value={formData.first_onset_date || ''}
              onChange={(e) => handleInputChange('first_onset_date', e.target.value)}
              className="bg-white border-slate-200"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">疼痛类型</Label>
          <Select
            value={formData.pain_type || ''}
            onValueChange={(value) => handleInputChange('pain_type', value)}
          >
            <SelectTrigger className="bg-white border-slate-200">
              <SelectValue placeholder="请选择疼痛类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="机械性">机械性</SelectItem>
              <SelectItem value="炎症性">炎症性</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="aggravating_factors" className="text-slate-700 font-medium">
              加重因素
            </Label>
            <Textarea
              id="aggravating_factors"
              value={formData.aggravating_factors || ''}
              onChange={(e) => handleInputChange('aggravating_factors', e.target.value)}
              placeholder="什么情况下疼痛会加重"
              className="bg-white border-slate-200 h-16"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relieving_factors" className="text-slate-700 font-medium">
              缓解因素
            </Label>
            <Textarea
              id="relieving_factors"
              value={formData.relieving_factors || ''}
              onChange={(e) => handleInputChange('relieving_factors', e.target.value)}
              placeholder="什么情况下疼痛会缓解"
              className="bg-white border-slate-200 h-16"
            />
          </div>
        </div>

        {/* 放射痛 */}
        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="has_radiation"
              checked={formData.has_radiation || false}
              onCheckedChange={handleRadiationChange}
            />
            <Label htmlFor="has_radiation" className="text-slate-700 font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              是否有放射痛
            </Label>
          </div>
          
          {formData.has_radiation && (
            <div className="space-y-2">
              <Label htmlFor="radiation_location" className="text-slate-700 font-medium">
                放射至何处
              </Label>
              <Input
                id="radiation_location"
                value={formData.radiation_location || ''}
                onChange={(e) => handleInputChange('radiation_location', e.target.value)}
                placeholder="请描述放射痛的位置"
                className="bg-white border-slate-200"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="previous_treatment" className="text-slate-700 font-medium">
              其他已接受治疗
            </Label>
            <Textarea
              id="previous_treatment"
              value={formData.previous_treatment || ''}
              onChange={(e) => handleInputChange('previous_treatment', e.target.value)}
              placeholder="请描述之前接受过的治疗"
              className="bg-white border-slate-200 h-16"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-slate-700 font-medium">病情进展</Label>
            <Select
              value={formData.condition_progress || ''}
              onValueChange={(value) => handleInputChange('condition_progress', value)}
            >
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="请选择病情进展情况" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="改善">改善</SelectItem>
                <SelectItem value="恶化">恶化</SelectItem>
                <SelectItem value="稳定">稳定</SelectItem>
                <SelectItem value="波动">波动</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
