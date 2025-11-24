import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Lightbulb, ClipboardEdit, Pill } from "lucide-react";

export default function InterventionSection({ formData, updateFormData }) {
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
    { key: 'posture_correction', label: '姿势矫正' },
    { key: 'pain_management', label: '疼痛调节（热敷）' },
    { key: 'therapeutic_exercise', label: '治疗性运动' },
    { key: 'gait_reeducation', label: '步态再教育' }
  ];

  const recommendations = [
    { key: 'discharge_with_advice', label: '出院并提供建议及家庭锻炼计划' },
    { key: 'specialist_followup', label: '进一步专科门诊(SOPD)随访' },
    { key: 'outpatient_pt', label: '门诊物理治疗' },
    { key: 'day_rehabilitation', label: '日间康复' },
    { key: 'medication_intervention', label: '药物干预' }
  ];

  return (
    <div className="space-y-6">
      {/* 干预措施 */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            干预措施
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
            后续建议
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
            药物信息
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="medication_details"
            value={formData.medication_details || ''}
            onChange={(e) => handleInputChange('medication_details', e.target.value)}
            placeholder="请详细记录药物信息，包括：&#10;• 药物名称（如：布洛芬缓释胶囊）&#10;• 用药剂量（如：200mg）&#10;• 用药频次（如：每日2次）&#10;• 用药时间（如：餐后服用）&#10;• 疗程（如：连续服用7天）"
            className="bg-white border-slate-200 h-32"
          />
        </CardContent>
      </Card>

      {/* 备注 */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <ClipboardEdit className="w-5 h-5" />
            备注
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="remarks"
            value={formData.remarks || ''}
            onChange={(e) => handleInputChange('remarks', e.target.value)}
            placeholder="请填写其他需要备注的信息"
            className="bg-white border-slate-200 h-24"
          />
        </CardContent>
      </Card>

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-slate-600">
          <strong>提示：</strong>请根据患者的具体情况选择合适的干预措施和后续建议。药物信息栏会自动从上传的截图中提取相关信息，您也可以手动补充完善。完成后点击"完成提交"保存患者信息。
        </p>
      </div>
    </div>
  );
}