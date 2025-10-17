
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, RotateCcw, Zap, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import PostureAnalysisModal from "./PostureAnalysisModal";

export default function ObjectiveExamSection({ formData, updateFormData }) {
  const [showPostureAnalysis, setShowPostureAnalysis] = useState(false);

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  const handleNestedObjectChange = (parentField, childField, value) => {
    const currentData = formData[parentField] || {};
    updateFormData({
      [parentField]: { ...currentData, [childField]: value }
    });
  };

  const handlePostureAnalysisComplete = (analysisResult) => {
    // 将AI分析结果整合到表单数据中
    const postureData = {
      ai_posture_analysis: analysisResult
    };

    // 如果AI识别出了具体的ROM数据，也可以更新到对应字段
    if (analysisResult.rom_degrees) {
      const currentLumbarRom = formData.lumbar_rom || {};
      postureData.lumbar_rom = {
        ...currentLumbarRom,
        flexion: `${analysisResult.rom_degrees}° (AI测量)`
      };
    }

    updateFormData(postureData);
  };

  const reflexGrades = ["-", "+", "++", "+++", "++++"];
  const pathologicalOptions = ["-", "+"];
  const myotomeScores = ["0", "1", "2", "3", "4", "5"];

  const postureOptions = {
    cervical: ["颈椎前凸过度", "正常曲度", "颈椎前凸消失", "颈椎后凸"],
    lumbar: ["腰椎前凸过度", "正常曲度", "腰椎曲度变平", "腰椎后凸"]
  };

  return (
    <div className="space-y-6">
      {/* AI姿态分析模块 */}
      <Card className="border-2 border-blue-200 bg-blue-50/30">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-blue-600" />
            AI姿态分析
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-600 mb-4">
            通过AI分析患者站立和弯腰姿势照片，自动测量脊柱前屈活动范围
          </div>

          <Button
            onClick={() => setShowPostureAnalysis(true)}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            <Camera className="w-4 h-4 mr-2" />
            开始姿态分析
          </Button>

          {/* 显示AI分析结果 */}
          {formData.ai_posture_analysis && (
            <div className="bg-white p-4 rounded-lg border border-blue-200 mt-4">
              <h5 className="font-medium text-slate-800 mb-3">AI分析结果：</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <span className="text-slate-600">前屈活动范围：</span>
                  <span className="font-semibold text-blue-700 ml-1">
                    {formData.ai_posture_analysis.rom_degrees}°
                  </span>
                </div>
                <div>
                  <span className="text-slate-600">功能评估：</span>
                  <span className="font-semibold ml-1">
                    {formData.ai_posture_analysis.rom_assessment}
                  </span>
                </div>
                {formData.ai_posture_analysis.compensations && (
                  <div className="md:col-span-2">
                    <span className="text-slate-600">代偿动作：</span>
                    <span className="ml-1">{formData.ai_posture_analysis.compensations}</span>
                  </div>
                )}
                {formData.ai_posture_analysis.recommendations && (
                  <div className="md:col-span-2">
                    <span className="text-slate-600">建议：</span>
                    <span className="ml-1">{formData.ai_posture_analysis.recommendations}</span>
                  </div>
                )}
              </div>
              {/* Annotated Images */}
              {(formData.ai_posture_analysis.annotatedStandingUrl || formData.ai_posture_analysis.annotatedFlexionUrl) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  {formData.ai_posture_analysis.annotatedStandingUrl && (
                    <div className="space-y-2">
                      <p className="font-medium text-sm text-center text-slate-700">站立位姿态分析</p>
                      <img
                        src={formData.ai_posture_analysis.annotatedStandingUrl}
                        alt="站立位姿态分析"
                        className="rounded-lg border bg-slate-100 w-full h-[600px] object-contain"
                      />
                    </div>
                  )}
                  {formData.ai_posture_analysis.annotatedFlexionUrl && (
                    <div className="space-y-2">
                       <p className="font-medium text-sm text-center text-slate-700">屈曲位姿态分析</p>
                      <img
                        src={formData.ai_posture_analysis.annotatedFlexionUrl}
                        alt="屈曲位姿态分析"
                        className="rounded-lg border bg-slate-100 w-full h-[600px] object-contain"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 体态检查 */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            体态检查
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">颈椎体态</Label>
              <Select
                value={formData.cervical_posture || ''}
                onValueChange={(value) => handleInputChange('cervical_posture', value)}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder="请选择颈椎体态" />
                </SelectTrigger>
                <SelectContent>
                  {postureOptions.cervical.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">腰椎体态</Label>
              <Select
                value={formData.lumbar_posture || ''}
                onValueChange={(value) => handleInputChange('lumbar_posture', value)}
              >
                <SelectTrigger className="bg-white border-slate-200">
                  <SelectValue placeholder="请选择腰椎体态" />
                </SelectTrigger>
                <SelectContent>
                  {postureOptions.lumbar.map((option) => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 活动度检查 */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <RotateCcw className="w-5 h-5" />
            活动度检查 (ROM)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 颈椎活动度 */}
          <div>
            <h4 className="font-medium text-slate-700 mb-3">颈椎活动度</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['flexion', 'extension', 'left_lateral', 'right_lateral', 'left_rotation', 'right_rotation'].map((movement) => (
                <div key={movement} className="space-y-2">
                  <Label className="text-sm text-slate-600">
                    {movement === 'flexion' ? '屈曲' :
                     movement === 'extension' ? '伸展' :
                     movement === 'left_lateral' ? '左侧屈' :
                     movement === 'right_lateral' ? '右侧屈' :
                     movement === 'left_rotation' ? '左侧旋转' : '右侧旋转'}
                  </Label>
                  <Input
                    value={(formData.cervical_rom || {})[movement] || ''}
                    onChange={(e) => handleNestedObjectChange('cervical_rom', movement, e.target.value)}
                    placeholder="角度或描述"
                    className="bg-white border-slate-200 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 腰椎活动度 */}
          <div>
            <h4 className="font-medium text-slate-700 mb-3">腰椎活动度</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {['flexion', 'extension', 'left_lateral', 'right_lateral', 'left_rotation', 'right_rotation'].map((movement) => (
                <div key={movement} className="space-y-2">
                  <Label className="text-sm text-slate-600">
                    {movement === 'flexion' ? '屈曲' :
                     movement === 'extension' ? '伸展' :
                     movement === 'left_lateral' ? '左侧屈' :
                     movement === 'right_lateral' ? '右侧屈' :
                     movement === 'left_rotation' ? '左侧旋转' : '右侧旋转'}
                  </Label>
                  <Input
                    value={(formData.lumbar_rom || {})[movement] || ''}
                    onChange={(e) => handleNestedObjectChange('lumbar_rom', movement, e.target.value)}
                    placeholder="角度或描述"
                    className="bg-white border-slate-200 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 神经系统检查 */}
      <Card className="border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            神经系统检查
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 特殊试验 */}
          <div>
            <h4 className="font-medium text-slate-700 mb-3">特殊试验</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">直腿抬高试验 - 左侧角度</Label>
                <Input
                  value={(formData.slr_test || {}).left_angle || ''}
                  onChange={(e) => handleNestedObjectChange('slr_test', 'left_angle', e.target.value)}
                  placeholder="角度"
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">直腿抬高试验 - 右侧角度</Label>
                <Input
                  value={(formData.slr_test || {}).right_angle || ''}
                  onChange={(e) => handleNestedObjectChange('slr_test', 'right_angle', e.target.value)}
                  placeholder="角度"
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">股神经牵拉试验 - 左侧</Label>
                <Input
                  value={(formData.femoral_nerve_test || {}).left || ''}
                  onChange={(e) => handleNestedObjectChange('femoral_nerve_test', 'left', e.target.value)}
                  placeholder="结果"
                  className="bg-white border-slate-200"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">股神经牵拉试验 - 右侧</Label>
                <Input
                  value={(formData.femoral_nerve_test || {}).right || ''}
                  onChange={(e) => handleNestedObjectChange('femoral_nerve_test', 'right', e.target.value)}
                  placeholder="结果"
                  className="bg-white border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* 反射检查 */}
          <div>
            <h4 className="font-medium text-slate-700 mb-3">反射检查</h4>
            <div className="grid grid-cols-4 gap-3 text-sm">
              <div className="font-medium text-slate-600">反射</div>
              <div className="font-medium text-slate-600">左侧</div>
              <div className="font-medium text-slate-600">右侧</div>
              <div></div>

              {[
                { key: 'biceps', label: '二头肌' },
                { key: 'triceps', label: '三头肌' },
                { key: 'knee', label: '膝反射' },
                { key: 'ankle', label: '踝反射' }
              ].map((reflex) => (
                <React.Fragment key={reflex.key}>
                  <div className="flex items-center text-slate-700">{reflex.label}</div>
                  <Select
                    value={(formData.reflexes || {})[`${reflex.key}_left`] || ''}
                    onValueChange={(value) => handleNestedObjectChange('reflexes', `${reflex.key}_left`, value)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reflexGrades.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={(formData.reflexes || {})[`${reflex.key}_right`] || ''}
                    onValueChange={(value) => handleNestedObjectChange('reflexes', `${reflex.key}_right`, value)}
                  >
                    <SelectTrigger className="bg-white border-slate-200 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reflexGrades.map((grade) => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div></div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 远端下肢脉搏检查 */}
      <div className="space-y-2">
        <Label className="text-slate-700 font-medium">远端下肢脉搏检查</Label>
        <Select
          value={formData.distal_pulse || ''}
          onValueChange={(value) => handleInputChange('distal_pulse', value)}
        >
          <SelectTrigger className="bg-white border-slate-200">
            <SelectValue placeholder="请选择检查结果" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="存在">存在</SelectItem>
            <SelectItem value="不存在">不存在</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* AI姿态分析弹窗 */}
      <PostureAnalysisModal
        isOpen={showPostureAnalysis}
        onClose={() => setShowPostureAnalysis(false)}
        onAnalysisComplete={handlePostureAnalysisComplete}
      />
    </div>
  );
}
