import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Lightbulb, ClipboardEdit, Pill } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function InterventionSection({ formData, updateFormData }) {
  const { t } = useTranslation();

  const handleInterventionChange = (intervention, checked) => {
    const currentInterventions = formData.interventions || {};
    updateFormData({
      interventions: { ...currentInterventions, [intervention]: checked }
    });
  };

  const handleRecommendationChange = (recommendation, checked) => {
    const currentRecommendations = formData.recommendations || {};
    updateFormData({
      recommendations: { ...currentRecommendations, [recommendation]: checked }
    });
  };

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  const interventions = [
    { key: 'posture_correction', label: t('form.intervention.options.postureCorrection') },
    { key: 'pain_management', label: t('form.intervention.options.painManagement') },
    { key: 'therapeutic_exercise', label: t('form.intervention.options.therapeuticExercise') },
    { key: 'gait_reeducation', label: t('form.intervention.options.gaitReeducation') }
  ];

  const recommendations = [
    { key: 'discharge_with_advice', label: t('form.intervention.options.discharge') },
    { key: 'specialist_followup', label: t('form.intervention.options.specialistFollowup') },
    { key: 'outpatient_pt', label: t('form.intervention.options.outpatientPT') },
    { key: 'day_rehabilitation', label: t('form.intervention.options.dayRehab') },
    { key: 'medication_intervention', label: t('form.intervention.options.medication') }
  ];

  return (
    <div className="space-y-6">
      {/* 干预措施 */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t('form.intervention.interventions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interventions.map((intervention) => (
              <div key={intervention.key} className="flex items-center space-x-2">
                <Checkbox
                  id={intervention.key}
                  checked={(formData.interventions || {})[intervention.key] || false}
                  onCheckedChange={(checked) => handleInterventionChange(intervention.key, checked)}
                />
                <Label htmlFor={intervention.key} className="text-slate-700 font-medium">
                  {intervention.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 建议 */}
      <Card className="border border-emerald-200 bg-emerald-50/50">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-emerald-600" />
            {t('form.intervention.recommendations')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recommendations.map((recommendation) => (
              <div key={recommendation.key} className="flex items-start space-x-2">
                <Checkbox
                  id={recommendation.key}
                  checked={(formData.recommendations || {})[recommendation.key] || false}
                  onCheckedChange={(checked) => handleRecommendationChange(recommendation.key, checked)}
                />
                <Label htmlFor={recommendation.key} className="text-slate-700 font-medium leading-tight">
                  {recommendation.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 药物信息详细记录 */}
      <Card className="border border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Pill className="w-5 h-5 text-blue-600" />
            {t('form.intervention.medicationInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="medication_details"
            value={formData.medication_details || ''}
            onChange={(e) => handleInputChange('medication_details', e.target.value)}
            placeholder={t('form.intervention.medicationPlaceholder')}
            className="bg-white border-slate-200 h-32"
          />
        </CardContent>
      </Card>

      {/* 备注 */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <ClipboardEdit className="w-5 h-5" />
            {t('form.intervention.remarks')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="remarks"
            value={formData.remarks || ''}
            onChange={(e) => handleInputChange('remarks', e.target.value)}
            placeholder={t('form.intervention.remarksPlaceholder')}
            className="bg-white border-slate-200 h-24"
          />
        </CardContent>
      </Card>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-slate-600">
          {t('form.intervention.hint')}
        </p>
      </div>
    </div>
  );
}
