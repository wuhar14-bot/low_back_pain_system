import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Phone, Calendar, Hash } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function BasicInfoSection({ formData, updateFormData }) {
  const { t } = useTranslation();
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700 font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            {t('form.basicInfo.patientName')}
          </Label>
          <Input
            id="name"
            value={formData.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder={t('form.basicInfo.patientNamePlaceholder')}
            className="bg-white border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="study_id" className="text-slate-700 font-medium flex items-center gap-2">
            <Hash className="w-4 h-4" />
            {t('form.basicInfo.studyId')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="study_id"
            value={formData.study_id || ''}
            onChange={(e) => handleInputChange('study_id', e.target.value)}
            placeholder={t('form.basicInfo.studyIdPlaceholder')}
            className="bg-white border-slate-200"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-slate-700 font-medium flex items-center gap-2">
            <Phone className="w-4 h-4" />
            {t('form.basicInfo.phone')}
          </Label>
          <Input
            id="phone"
            value={formData.phone || ''}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder={t('form.basicInfo.phonePlaceholder')}
            className="bg-white border-slate-200"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age" className="text-slate-700 font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t('form.basicInfo.age')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="age"
            type="number"
            min="0"
            max="150"
            value={formData.age || ''}
            onChange={(e) => handleInputChange('age', e.target.value ? parseInt(e.target.value) : '')}
            placeholder={t('form.basicInfo.agePlaceholder')}
            className="bg-white border-slate-200"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-slate-700 font-medium">
            {t('form.basicInfo.gender')} <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={formData.gender || ''}
            onValueChange={(value) => handleInputChange('gender', value)}
            className="flex gap-4"
            required
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="男" id="gender_male" />
              <Label htmlFor="gender_male" className="text-slate-700 font-normal cursor-pointer">{t('form.basicInfo.male')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="女" id="gender_female" />
              <Label htmlFor="gender_female" className="text-slate-700 font-normal cursor-pointer">{t('form.basicInfo.female')}</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-800">
          {t('form.basicInfo.requiredNote')}
        </p>
      </div>
    </div>
  );
}