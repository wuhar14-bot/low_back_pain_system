import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default function MedicalHistoryDetail({ patient }) {
  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <FileText className="w-5 h-5" />
          病史资料
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 现病史信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patient.history_type && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">现病史类型</h4>
              <Badge className={patient.history_type === '首次发作' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}>
                {patient.history_type}
              </Badge>
            </div>
          )}

          {patient.first_onset_date && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                初次发作日期
              </h4>
              <p className="text-slate-700">
                {format(new Date(patient.first_onset_date), "yyyy年MM月dd日")}
              </p>
            </div>
          )}
        </div>

        {/* 疼痛特征 */}
        {patient.pain_type && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">疼痛类型</h4>
            <Badge className={patient.pain_type === '机械性' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
              {patient.pain_type}
            </Badge>
          </div>
        )}

        {/* 影响因素 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {patient.aggravating_factors && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">加重因素</h4>
              <p className="text-slate-700 bg-red-50 p-3 rounded-lg border border-red-200">
                {patient.aggravating_factors}
              </p>
            </div>
          )}

          {patient.relieving_factors && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">缓解因素</h4>
              <p className="text-slate-700 bg-green-50 p-3 rounded-lg border border-green-200">
                {patient.relieving_factors}
              </p>
            </div>
          )}
        </div>

        {/* 放射痛 */}
        {patient.has_radiation && (
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">放射痛</h4>
            <p className="text-slate-700">
              存在放射痛{patient.radiation_location && `，放射至: ${patient.radiation_location}`}
            </p>
          </div>
        )}

        {/* 既往治疗 */}
        {patient.previous_treatment && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">既往治疗史</h4>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">
              {patient.previous_treatment}
            </p>
          </div>
        )}

        {/* 病情进展 */}
        {patient.condition_progress && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              病情进展
            </h4>
            <Badge className={
              patient.condition_progress === '改善' ? 'bg-green-100 text-green-800' :
              patient.condition_progress === '恶化' ? 'bg-red-100 text-red-800' :
              patient.condition_progress === '稳定' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }>
              {patient.condition_progress}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}