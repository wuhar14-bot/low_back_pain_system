import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, RotateCcw, Zap, BarChart3 } from "lucide-react";

export default function ExaminationResults({ patient }) {
  const renderROMSection = (title, romData, icon) => {
    if (!romData || Object.keys(romData).length === 0) return null;

    const movements = {
      flexion: '屈曲',
      extension: '伸展', 
      left_lateral: '左侧屈',
      right_lateral: '右侧屈',
      left_rotation: '左侧旋转',
      right_rotation: '右侧旋转'
    };

    return (
      <div>
        <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          {icon}
          {title}
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(romData).map(([key, value]) => (
            value && (
              <div key={key} className="bg-slate-50 p-2 rounded text-sm">
                <span className="text-slate-600">{movements[key] || key}: </span>
                <span className="font-medium text-slate-800">{value}</span>
              </div>
            )
          ))}
        </div>
      </div>
    );
  };

  const renderReflexSection = (reflexes) => {
    if (!reflexes || Object.keys(reflexes).length === 0) return null;

    const reflexLabels = {
      biceps_left: '二头肌(左)',
      biceps_right: '二头肌(右)',
      triceps_left: '三头肌(左)', 
      triceps_right: '三头肌(右)',
      knee_left: '膝反射(左)',
      knee_right: '膝反射(右)',
      ankle_left: '踝反射(左)',
      ankle_right: '踝反射(右)'
    };

    return (
      <div>
        <h4 className="font-semibold text-slate-800 mb-3">反射检查</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(reflexes).map(([key, value]) => (
            value && (
              <div key={key} className="bg-slate-50 p-2 rounded text-sm">
                <span className="text-slate-600">{reflexLabels[key] || key}: </span>
                <Badge variant="outline" className="ml-1">
                  {value}
                </Badge>
              </div>
            )
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-6">
      {/* 客观检查 */}
      <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Activity className="w-5 h-5" />
            客观检查结果
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 体态 */}
          {(patient.cervical_posture || patient.lumbar_posture) && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">体态检查</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patient.cervical_posture && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <span className="text-sm text-slate-600">颈椎体态: </span>
                    <Badge className="bg-blue-100 text-blue-800">{patient.cervical_posture}</Badge>
                  </div>
                )}
                {patient.lumbar_posture && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <span className="text-sm text-slate-600">腰椎体态: </span>
                    <Badge className="bg-green-100 text-green-800">{patient.lumbar_posture}</Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 活动度检查 */}
          {renderROMSection("颈椎活动度", patient.cervical_rom, <RotateCcw className="w-4 h-4" />)}
          {renderROMSection("腰椎活动度", patient.lumbar_rom, <RotateCcw className="w-4 h-4" />)}

          {/* 特殊试验 */}
          {(patient.slr_test || patient.femoral_nerve_test) && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-3">特殊试验</h4>
              <div className="space-y-3">
                {patient.slr_test && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <h5 className="font-medium text-purple-800 mb-2">直腿抬高试验 (SLR)</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {patient.slr_test.left_angle && (
                        <span>左侧: <Badge variant="outline">{patient.slr_test.left_angle}</Badge></span>
                      )}
                      {patient.slr_test.right_angle && (
                        <span>右侧: <Badge variant="outline">{patient.slr_test.right_angle}</Badge></span>
                      )}
                    </div>
                  </div>
                )}
                {patient.femoral_nerve_test && (
                  <div className="bg-orange-50 p-3 rounded-lg">
                    <h5 className="font-medium text-orange-800 mb-2">股神经牵拉试验</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {patient.femoral_nerve_test.left && (
                        <span>左侧: <Badge variant="outline">{patient.femoral_nerve_test.left}</Badge></span>
                      )}
                      {patient.femoral_nerve_test.right && (
                        <span>右侧: <Badge variant="outline">{patient.femoral_nerve_test.right}</Badge></span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 神经系统检查 */}
          {renderReflexSection(patient.reflexes)}

          {/* 远端脉搏 */}
          {patient.distal_pulse && (
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">远端下肢脉搏检查</h4>
              <Badge className={patient.distal_pulse === '存在' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {patient.distal_pulse}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 功能评分 */}
      {(patient.rmdq_score !== undefined || patient.ndi_score !== undefined) && (
        <Card className="border-0 shadow-lg bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-800">
              <BarChart3 className="w-5 h-5" />
              功能评分结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {patient.rmdq_score !== undefined && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-800 mb-2">罗兰-莫里斯残疾问卷 (RMDQ)</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-blue-600">{patient.rmdq_score}</span>
                    <span className="text-slate-600">/ 24分</span>
                  </div>
                  <Badge className={
                    patient.rmdq_score <= 4 ? 'bg-green-100 text-green-800' :
                    patient.rmdq_score <= 14 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {patient.rmdq_score <= 4 ? '轻微残疾' :
                     patient.rmdq_score <= 14 ? '中等残疾' : '重度残疾'}
                  </Badge>
                </div>
              )}

              {patient.ndi_score !== undefined && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-slate-800 mb-2">颈部残疾指数 (NDI)</h4>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-purple-600">{patient.ndi_score}</span>
                    <span className="text-slate-600">%</span>
                  </div>
                  <Badge className={
                    patient.ndi_score <= 20 ? 'bg-green-100 text-green-800' :
                    patient.ndi_score <= 40 ? 'bg-yellow-100 text-yellow-800' :
                    patient.ndi_score <= 60 ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {patient.ndi_score <= 20 ? '轻微残疾' :
                     patient.ndi_score <= 40 ? '中等残疾' :
                     patient.ndi_score <= 60 ? '重度残疾' : '完全残疾'}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}