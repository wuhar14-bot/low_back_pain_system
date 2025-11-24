import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ClipboardList, Lightbulb, Settings } from "lucide-react";

export default function TreatmentPlan({ patient }) {
  const interventions = patient.interventions ? Object.entries(patient.interventions)
    .filter(([, value]) => value)
    .map(([key]) => {
      const labels = {
        posture_correction: '姿势矫正',
        pain_management: '疼痛调节（热敷）',
        therapeutic_exercise: '治疗性运动',
        gait_reeducation: '步态再教育'
      };
      return labels[key] || key;
    }) : [];

  const recommendations = patient.recommendations ? Object.entries(patient.recommendations)
    .filter(([, value]) => value)
    .map(([key]) => {
      const labels = {
        discharge_with_advice: '出院并提供建议及家庭锻炼计划',
        specialist_followup: '进一步专科门诊(SOPD)随访',
        outpatient_pt: '门诊物理治疗',
        day_rehabilitation: '日间康复',
        medication_intervention: '药物干预'
      };
      return labels[key] || key;
    }) : [];

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <ClipboardList className="w-5 h-5" />
          干预与建议
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {interventions.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              干预措施
            </h4>
            <div className="flex flex-wrap gap-2">
              {interventions.map((item) => (
                <Badge key={item} variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  <Check className="w-3 h-3 mr-1" />
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {recommendations.length > 0 && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              后续建议
            </h4>
            <div className="flex flex-wrap gap-2">
              {recommendations.map((item) => (
                <Badge key={item} variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200">
                  <Check className="w-3 h-3 mr-1" />
                  {item}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {patient.remarks && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-3">备注</h4>
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-700 whitespace-pre-wrap">{patient.remarks}</p>
            </div>
          </div>
        )}

        {interventions.length === 0 && recommendations.length === 0 && !patient.remarks &&(
           <p className="text-slate-500">未记录干预建议或备注信息。</p>
        )}
      </CardContent>
    </Card>
  );
}