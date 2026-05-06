import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function SubjectiveExamSection({ formData, updateFormData }) {
  const { t } = useTranslation();
  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  const handleCheckboxWithInput = (checkboxField, inputField, checked) => {
    updateFormData({
      [checkboxField]: checked,
      [inputField]: checked ? (formData[inputField] || '') : ''
    });
  };

  const handleRedFlagChange = (flag, checked) => {
    const currentFlags = formData.red_flags || {};
    updateFormData({
      red_flags: { ...currentFlags, [flag]: checked }
    });
  };

  const handleCervicalFunctionChange = (item, checked) => {
    const currentProblems = formData.cervical_function_problems || {};
    updateFormData({
      cervical_function_problems: { ...currentProblems, [item]: checked }
    });
  };

  const redFlags = [
    { key: 'weight_loss' },
    { key: 'appetite_loss' },
    { key: 'fever' },
    { key: 'night_pain' },
    { key: 'bladder_bowel_dysfunction' },
    { key: 'saddle_numbness' },
    { key: 'bilateral_limb_weakness' },
    { key: 'bilateral_sensory_abnormal' },
    { key: 'hand_clumsiness' },
    { key: 'gait_abnormal' }
  ];

  const cervicalFunctionItems = [
    { key: 'dropping_objects' },
    { key: 'difficulty_picking_small_items' },
    { key: 'writing_difficulty' },
    { key: 'phone_usage_difficulty' },
    { key: 'buttoning_difficulty' },
    { key: 'chopstick_usage_difficulty' }
  ];

  return (
    <div className="space-y-6">
      {/* Pain Score */}
      <div className="space-y-3">
        <Label className="text-slate-700 font-medium flex items-center gap-2">
          <Activity className="w-4 h-4" />
          {t('form.subjective.painScore')}
        </Label>
        <div className="text-sm text-slate-600 mb-2">
          {t('form.subjective.painScoreHint')}
        </div>
        <RadioGroup
          value={formData.pain_score?.toString() || ''}
          onValueChange={(value) => handleInputChange('pain_score', parseInt(value))}
          className="flex justify-between"
        >
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
            <div key={score} className="flex flex-col items-center space-y-1">
              <RadioGroupItem value={score.toString()} id={`pain_${score}`} className="h-5 w-5" />
              <Label htmlFor={`pain_${score}`} className="text-slate-700 font-medium cursor-pointer text-sm">{score}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Tolerance */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {t('form.subjective.toleranceTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sitting_tolerance" className="text-slate-700 font-medium">{t('form.subjective.sitting')}</Label>
              <Input
                id="sitting_tolerance"
                type="number"
                value={formData.sitting_tolerance || ''}
                onChange={(e) => handleInputChange('sitting_tolerance', parseInt(e.target.value))}
                placeholder={t('form.subjective.minutesPlaceholder')}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standing_tolerance" className="text-slate-700 font-medium">{t('form.subjective.standing')}</Label>
              <Input
                id="standing_tolerance"
                type="number"
                value={formData.standing_tolerance || ''}
                onChange={(e) => handleInputChange('standing_tolerance', parseInt(e.target.value))}
                placeholder={t('form.subjective.minutesPlaceholder')}
                className="bg-white border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="walking_tolerance" className="text-slate-700 font-medium">{t('form.subjective.walking')}</Label>
              <Input
                id="walking_tolerance"
                type="number"
                value={formData.walking_tolerance || ''}
                onChange={(e) => handleInputChange('walking_tolerance', parseInt(e.target.value))}
                placeholder={t('form.subjective.minutesPlaceholder')}
                className="bg-white border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="has_assistive_tools"
                  checked={formData.has_assistive_tools || false}
                  onCheckedChange={(checked) => handleCheckboxWithInput('has_assistive_tools', 'assistive_tools', checked)}
                />
                <Label htmlFor="has_assistive_tools" className="text-slate-700 font-medium">{t('form.subjective.assistiveTools')}</Label>
              </div>
              <Input
                id="assistive_tools"
                value={formData.assistive_tools || ''}
                onChange={(e) => handleInputChange('assistive_tools', e.target.value)}
                placeholder={t('form.subjective.assistiveToolsPlaceholder')}
                className="bg-white border-slate-200"
                disabled={!formData.has_assistive_tools}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="has_claudication"
                  checked={formData.has_claudication || false}
                  onCheckedChange={(checked) => handleCheckboxWithInput('has_claudication', 'claudication_distance', checked)}
                />
                <Label htmlFor="has_claudication" className="text-slate-700 font-medium">{t('form.subjective.claudicationDistance')}</Label>
              </div>
              <Input
                id="claudication_distance"
                value={formData.claudication_distance || ''}
                onChange={(e) => handleInputChange('claudication_distance', e.target.value)}
                placeholder={t('form.subjective.claudicationPlaceholder')}
                className="bg-white border-slate-200"
                disabled={!formData.has_claudication}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Red Flags */}
      <Card className="border border-red-200 bg-red-50/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            {t('form.subjective.redFlags')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {redFlags.map((flag) => (
              <div key={flag.key} className="flex items-center space-x-2">
                <Checkbox
                  id={flag.key}
                  checked={(formData.red_flags || {})[flag.key] || false}
                  onCheckedChange={(checked) => handleRedFlagChange(flag.key, checked)}
                />
                <Label htmlFor={flag.key} className="text-sm font-medium text-slate-700">
                  {t(`form.subjective.redFlagsList.${flag.key}`)}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cervical Hand Function */}
      <Card className="border border-slate-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-800">
            {t('form.subjective.cervicalHandFunction')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cervicalFunctionItems.map((item) => (
              <div key={item.key} className="flex items-center space-x-2">
                <Checkbox
                  id={item.key}
                  checked={(formData.cervical_function_problems || {})[item.key] || false}
                  onCheckedChange={(checked) => handleCervicalFunctionChange(item.key, checked)}
                />
                <Label htmlFor={item.key} className="text-sm font-medium text-slate-700">
                  {t(`form.subjective.handFunctionList.${item.key}`)}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}