import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Clock, AlertTriangle } from "lucide-react";

export default function PatientDetailInfo({ patient }) {
  const toleranceData = [
    { label: '坐姿耐受', value: patient.sitting_tolerance, unit: '分钟' },
    { label: '站立耐受', value: patient.standing_tolerance, unit: '分钟' },
    { label: '行走耐受', value: patient.walking_tolerance, unit: '分钟' }
  ];

  return (
    <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <User className="w-5 h-5" />
          基本信息与主观检查
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 疼痛评分 */}
        {patient.pain_score !== undefined && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-slate-800 mb-2">疼痛评分 (NPRS)</h4>
            <div className="flex items-center gap-3">
              <div className="text-3xl font-bold text-red-600">{patient.pain_score}</div>
              <div className="text-slate-600">/ 10分</div>
            </div>
          </div>
        )}

        {/* 耐受时间 */}
        <div>
          <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            耐受时间
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {toleranceData.map((item) => (
              <div key={item.label} className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm text-slate-600">{item.label}</p>
                <p className="font-semibold text-slate-800">
                  {item.value !== undefined ? `${item.value} ${item.unit}` : '未记录'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 辅助工具 */}
        {patient.assistive_tools && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">辅助工具</h4>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{patient.assistive_tools}</p>
          </div>
        )}

        {/* 间歇性跛行距离 */}
        {patient.claudication_distance && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-2">间歇性跛行距离</h4>
            <p className="text-slate-700 bg-slate-50 p-3 rounded-lg">{patient.claudication_distance}</p>
          </div>
        )}

        {/* 危险信号 */}
        {patient.red_flags && Object.values(patient.red_flags).some(flag => flag === true) && (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              危险信号筛查
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(patient.red_flags).map(([key, value]) => {
                if (!value) return null;
                const labels = {
                  weight_loss: '显著体重减轻',
                  appetite_loss: '食欲不振',
                  fever: '发热',
                  night_pain: '夜间疼痛',
                  bladder_bowel_dysfunction: '膀胱/肠道功能障碍',
                  saddle_numbness: '鞍区麻木',
                  bilateral_limb_weakness: '双侧上肢/下肢无力',
                  bilateral_sensory_abnormal: '双侧上肢/下肢感觉异常',
                  hand_clumsiness: '手部不灵活',
                  gait_abnormal: '步态异常'
                };
                return (
                  <Badge key={key} className="bg-red-100 text-red-800 border-red-300">
                    {labels[key] || key}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* 颈椎功能问题 */}
        {patient.cervical_function_problems && Object.values(patient.cervical_function_problems).some(problem => problem === true) && (
          <div>
            <h4 className="font-semibold text-slate-800 mb-3">颈椎相关手功能问题</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(patient.cervical_function_problems).map(([key, value]) => {
                if (!value) return null;
                const labels = {
                  dropping_objects: '物品掉落',
                  difficulty_picking_small_items: '难以拾取小物件',
                  writing_difficulty: '书写困难',
                  phone_usage_difficulty: '使用手机困难',
                  buttoning_difficulty: '扣纽扣困难',
                  chopstick_usage_difficulty: '使用筷子困难'
                };
                return (
                  <Badge key={key} className="bg-orange-100 text-orange-800 border-orange-300">
                    {labels[key] || key}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}