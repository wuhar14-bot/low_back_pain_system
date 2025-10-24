import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Phone, Calendar, Hash } from "lucide-react";

export default function BasicInfoSection({ formData, updateFormData }) {
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700 font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            患者姓名
          </Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="请输入患者姓名"
            className="bg-white border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="study_id" className="text-slate-700 font-medium flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Study ID <span className="text-red-500">*</span>
          </Label>
          <Input
            id="study_id"
            value={formData.study_id || ''}
            onChange={(e) => handleInputChange('study_id', e.target.value)}
            placeholder="请输入Study ID（必填）"
            className="bg-white border-slate-200"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-slate-700 font-medium flex items-center gap-2">
            <Phone className="w-4 h-4" />
            联系电话
          </Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="请输入联系电话"
            className="bg-white border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age" className="text-slate-700 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            年龄 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            min="0"
            max="150"
            value={formData.age || ''}
            onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : '')}
            placeholder="请输入年龄（必填）"
            className="bg-white border-slate-200"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">
            性别 <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formData.gender || ''}
            onValueChange={(value) => handleInputChange('gender', value)}
            className="flex gap-4"
            required
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="男" id="gender_male" />
              <Label htmlFor="gender_male" className="text-slate-700 font-normal cursor-pointer">男</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="女" id="gender_female" />
              <Label htmlFor="gender_female" className="text-slate-700 font-normal cursor-pointer">女</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          <span className="font-medium">注意：</span>标有 <span className="text-red-500">*</span> 的字段为必填项，必须填写才能提交患者信息。
        </p>
      </div>
    </div>
  );
}